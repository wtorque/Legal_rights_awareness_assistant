"""Registration, sign-in, sessions and profile. Email and password only; other methods are not built (KNOWN_ISSUES)."""
import time
import uuid
from datetime import UTC, datetime

from starlette.concurrency import run_in_threadpool

from app.core.config import Settings
from app.core.exceptions import Conflict, RateLimited, Unauthorized, ValidationFailed
from app.core.logging import get_logger
from app.core.security import create_token, decode_token, hash_password, verify_password
from app.repositories.users import UserRepository
from app.schemas.auth import PasswordChange, ProfileUpdate, RegisterRequest, Session, StoredUser, User

log = get_logger("auth")
MAX_FAILURES = 5
WINDOW_SECONDS = 15 * 60
# Process-local failure log: slows guessing on one instance. A shared store is needed for several instances.
_failures: dict[str, list[float]] = {}


def _recent(key: str) -> list[float]:
    cutoff = time.time() - WINDOW_SECONDS
    hits = [t for t in _failures.get(key, []) if t > cutoff]
    _failures[key] = hits
    return hits


def reset_rate_limits() -> None:
    _failures.clear()


class AuthService:
    def __init__(self, repo: UserRepository, settings: Settings) -> None:
        self._repo = repo
        self._settings = settings

    def _session(self, user: StoredUser) -> Session:
        access, lifetime = create_token(self._settings, user.id, "access")
        refresh, _ = create_token(self._settings, user.id, "refresh")
        return Session(access_token=access, refresh_token=refresh, expires_in=lifetime, user=User.model_validate(user.model_dump(exclude={"password_hash"})))

    async def register(self, body: RegisterRequest) -> Session:
        email = body.email.lower()
        if await run_in_threadpool(self._repo.find_by_email, email):
            raise Conflict("An account with this email already exists")
        user = StoredUser(
            id=uuid.uuid4().hex, email=email, name=body.name.strip(), language=body.language,
            created_at=datetime.now(UTC), password_hash=await run_in_threadpool(hash_password, body.password),
        )
        await run_in_threadpool(self._repo.save, user)
        log.info("user_registered", user_id=user.id)
        return self._session(user)

    async def login(self, email: str, password: str) -> Session:
        key = email.lower()
        if len(_recent(key)) >= MAX_FAILURES:
            raise RateLimited("Too many failed attempts. Try again in 15 minutes.")
        user = await run_in_threadpool(self._repo.find_by_email, key)
        ok = await run_in_threadpool(verify_password, password, user.password_hash if user else None)
        if not (ok and user):
            _failures.setdefault(key, []).append(time.time())
            log.warning("login_failed")
            raise Unauthorized("Email or password is incorrect")
        _failures.pop(key, None)
        log.info("login_ok", user_id=user.id)
        return self._session(user)

    async def refresh(self, refresh_token: str) -> Session:
        user = await self._load(decode_token(self._settings, refresh_token, "refresh"))
        return self._session(user)

    async def _load(self, user_id: str) -> StoredUser:
        user = await run_in_threadpool(self._repo.get, user_id)
        if user is None:
            raise Unauthorized("Your session is not valid. Please sign in again.")
        return user

    async def user_for_token(self, token: str) -> User:
        user = await self._load(decode_token(self._settings, token, "access"))
        return User.model_validate(user.model_dump(exclude={"password_hash"}))

    async def update_profile(self, user_id: str, body: ProfileUpdate) -> User:
        user = await self._load(user_id)
        for field, value in body.model_dump(exclude_none=True).items():
            setattr(user, field, type(getattr(user, field))(**value) if field == "notifications" else value)
        await run_in_threadpool(self._repo.save, user)
        return User.model_validate(user.model_dump(exclude={"password_hash"}))

    async def change_password(self, user_id: str, body: PasswordChange) -> None:
        user = await self._load(user_id)
        if not await run_in_threadpool(verify_password, body.current_password, user.password_hash):
            raise ValidationFailed("Current password is incorrect")
        user.password_hash = await run_in_threadpool(hash_password, body.new_password)
        await run_in_threadpool(self._repo.save, user)
        log.info("password_changed", user_id=user.id)
