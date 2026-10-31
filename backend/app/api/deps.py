from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.core.exceptions import Forbidden, Unauthorized
from app.repositories.users import UserRepository
from app.schemas.auth import User
from app.services.auth import AuthService

_bearer = HTTPBearer(auto_error=False)


def get_auth_service(settings: Settings = Depends(get_settings)) -> AuthService:
    return AuthService(UserRepository(settings.users_dir), settings)


async def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    service: AuthService = Depends(get_auth_service),
) -> User:
    if credentials is None:
        raise Unauthorized("Please sign in")
    return await service.user_for_token(credentials.credentials)


async def admin_user(user: User = Depends(current_user)) -> User:
    if user.role != "admin":
        raise Forbidden("You do not have access to this")
    return user
