"""Password hashing and signed tokens. Algorithms are pinned: tokens are only ever verified with the configured one."""
import time
import uuid
from typing import Literal

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from app.core.config import Settings
from app.core.exceptions import Unauthorized, UpstreamUnavailable

_hasher = PasswordHasher()
# Verified against when the account does not exist, so timing does not reveal which emails are registered.
_DUMMY_HASH = _hasher.hash("not-a-real-password")
MIN_SECRET_LENGTH = 32

TokenKind = Literal["access", "refresh"]


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, stored_hash: str | None) -> bool:
    try:
        return _hasher.verify(stored_hash or _DUMMY_HASH, password) and stored_hash is not None
    except (VerificationError, InvalidHashError):
        return False


def _secret(settings: Settings) -> str:
    secret = settings.jwt_secret.get_secret_value()
    if len(secret) < MIN_SECRET_LENGTH:
        raise UpstreamUnavailable("Authentication is not configured")
    return secret


def create_token(settings: Settings, user_id: str, kind: TokenKind) -> tuple[str, int]:
    """Returns (token, lifetime in seconds)."""
    lifetime = settings.access_token_ttl_minutes * 60 if kind == "access" else settings.refresh_token_ttl_days * 86400
    now = int(time.time())
    claims = {"sub": user_id, "typ": kind, "iat": now, "exp": now + lifetime, "jti": uuid.uuid4().hex}
    return jwt.encode(claims, _secret(settings), algorithm=settings.jwt_algorithm), lifetime


def decode_token(settings: Settings, token: str, kind: TokenKind) -> str:
    """Returns the user id, or raises Unauthorized for any bad, expired or wrong-type token."""
    try:
        claims = jwt.decode(token, _secret(settings), algorithms=[settings.jwt_algorithm], options={"require": ["exp", "sub", "typ"]})
    except jwt.PyJWTError as exc:
        raise Unauthorized("Your session is not valid. Please sign in again.") from exc
    if claims.get("typ") != kind:
        raise Unauthorized("Your session is not valid. Please sign in again.")
    return str(claims["sub"])
