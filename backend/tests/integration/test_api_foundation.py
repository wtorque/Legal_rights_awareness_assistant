import os

import pytest

pytestmark = pytest.mark.asyncio


async def test_health_reports_db_unavailable_without_crashing(client, settings_env):
    settings_env(DATABASE_URL="postgresql+asyncpg://nobody@127.0.0.1:1/none")
    r = await client.get("/api/v1/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "degraded" and body["database"] == "unavailable"


@pytest.mark.skipif("TEST_DATABASE_URL" not in os.environ, reason="needs a Postgres TEST_DATABASE_URL")
async def test_health_with_real_database(client, settings_env):
    settings_env(DATABASE_URL=os.environ["TEST_DATABASE_URL"])
    r = await client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["database"] == "ok"


async def test_unknown_route_uses_error_envelope(client):
    r = await client.get("/api/v1/nope")
    assert r.status_code == 404
    err = r.json()["error"]
    assert err["code"] == "not_found" and err["request_id"]
    assert r.headers["x-request-id"] == err["request_id"]


async def test_request_id_is_echoed_when_valid_and_replaced_when_not(client):
    ok = await client.get("/api/v1/health", headers={"X-Request-ID": "abc-123"})
    assert ok.headers["x-request-id"] == "abc-123"
    bad = await client.get("/api/v1/health", headers={"X-Request-ID": "bad id\t!"})
    assert bad.headers["x-request-id"] != "bad id\t!"


async def test_security_headers_present(client):
    r = await client.get("/api/v1/health")
    assert r.headers["x-content-type-options"] == "nosniff"
    assert r.headers["x-frame-options"] == "DENY"


async def test_oversized_body_rejected_by_content_length(client, settings_env):
    r = await client.post("/api/v1/health", content=b"x" * 2_000_000)
    assert r.status_code == 413
    assert r.json()["error"]["code"] == "payload_too_large"


async def test_cors_allows_only_configured_origin(client):
    good = await client.options("/api/v1/health", headers={
        "Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"})
    assert good.headers.get("access-control-allow-origin") == "http://localhost:3000"
    bad = await client.options("/api/v1/health", headers={
        "Origin": "https://evil.example", "Access-Control-Request-Method": "GET"})
    assert "access-control-allow-origin" not in bad.headers
