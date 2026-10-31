import time

import jwt
import pytest

from app.core.config import get_settings
from tests.conftest import register

pytestmark = pytest.mark.asyncio
PW = "correct-horse-battery"


async def test_register_login_me_and_profile(client):
    headers = await register(client)
    me = (await client.get("/api/v1/auth/me", headers=headers)).json()
    assert me["email"] == "reader@example.com" and me["role"] == "user" and "password" not in str(me)
    assert me["notifications"] == {"follow_ups": False, "product_updates": False}

    res = await client.post("/api/v1/auth/login", json={"email": "READER@example.com", "password": PW})
    assert res.status_code == 200 and res.json()["token_type"] == "bearer"

    patched = await client.patch("/api/v1/auth/me", headers=headers, json={"language": "te", "notifications": {"follow_ups": True, "product_updates": False}})
    assert patched.json()["language"] == "te" and patched.json()["notifications"]["follow_ups"] is True
    assert (await client.patch("/api/v1/auth/me", headers=headers, json={"role": "admin"})).status_code == 422


async def test_duplicate_email_and_weak_password_rejected(client):
    await register(client)
    dup = await client.post("/api/v1/auth/register", json={"email": "reader@example.com", "password": PW, "name": "x"})
    assert dup.status_code == 409
    weak = await client.post("/api/v1/auth/register", json={"email": "b@example.com", "password": "short", "name": "x"})
    assert weak.status_code == 422


async def test_wrong_password_and_unknown_email_look_the_same(client):
    await register(client)
    a = await client.post("/api/v1/auth/login", json={"email": "reader@example.com", "password": "wrong-password-1"})
    b = await client.post("/api/v1/auth/login", json={"email": "nobody@example.com", "password": "wrong-password-1"})
    assert a.status_code == b.status_code == 401 and a.json()["error"]["message"] == b.json()["error"]["message"]


async def test_login_is_rate_limited_after_repeated_failures(client):
    await register(client)
    for _ in range(5):
        assert (await client.post("/api/v1/auth/login", json={"email": "reader@example.com", "password": "wrong-password-1"})).status_code == 401
    locked = await client.post("/api/v1/auth/login", json={"email": "reader@example.com", "password": PW})
    assert locked.status_code == 429


async def test_token_attacks_are_rejected(client):
    headers = await register(client)
    settings = get_settings()
    secret = settings.jwt_secret.get_secret_value()
    uid = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]
    now = int(time.time())
    bad = {
        "none_alg": jwt.encode({"sub": uid, "typ": "access", "exp": now + 60}, None, algorithm="none"),
        "expired": jwt.encode({"sub": uid, "typ": "access", "exp": now - 10}, secret, algorithm="HS256"),
        "wrong_secret": jwt.encode({"sub": uid, "typ": "access", "exp": now + 60}, "x" * 40, algorithm="HS256"),
        "wrong_type": jwt.encode({"sub": uid, "typ": "refresh", "exp": now + 60}, secret, algorithm="HS256"),
        "other_alg": jwt.encode({"sub": uid, "typ": "access", "exp": now + 60}, secret, algorithm="HS384"),
        "unknown_user": jwt.encode({"sub": "0" * 32, "typ": "access", "exp": now + 60}, secret, algorithm="HS256"),
        "garbage": "not.a.token",
    }
    for name, token in bad.items():
        res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 401, name
    assert (await client.get("/api/v1/auth/me")).status_code == 401


async def test_refresh_requires_refresh_token_and_password_change_works(client):
    res = await client.post("/api/v1/auth/register", json={"email": "r@example.com", "password": PW, "name": "R"})
    body = res.json()
    ok = await client.post("/api/v1/auth/refresh", json={"refresh_token": body["refresh_token"]})
    assert ok.status_code == 200
    wrong = await client.post("/api/v1/auth/refresh", json={"refresh_token": body["access_token"]})
    assert wrong.status_code == 401
    h = {"Authorization": f"Bearer {body['access_token']}"}
    assert (await client.post("/api/v1/auth/password", headers=h, json={"current_password": "nope-nope-nope", "new_password": "another-long-pass"})).status_code == 422
    assert (await client.post("/api/v1/auth/password", headers=h, json={"current_password": PW, "new_password": "another-long-pass"})).status_code == 204
    assert (await client.post("/api/v1/auth/login", json={"email": "r@example.com", "password": PW})).status_code == 401
    assert (await client.post("/api/v1/auth/login", json={"email": "r@example.com", "password": "another-long-pass"})).status_code == 200


async def test_assistant_requires_sign_in(client):
    r = await client.post("/api/v1/assistant/answers", json={"question": "x", "jurisdiction_code": "IN"})
    assert r.status_code == 401
