from fastapi import APIRouter, Depends, Response

from app.api.deps import current_user, get_auth_service
from app.schemas.auth import LoginRequest, PasswordChange, ProfileUpdate, RefreshRequest, RegisterRequest, Session, User
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
async def register(body: RegisterRequest, service: AuthService = Depends(get_auth_service)) -> Session:
    return await service.register(body)


@router.post("/login")
async def login(body: LoginRequest, service: AuthService = Depends(get_auth_service)) -> Session:
    return await service.login(body.email, body.password)


@router.post("/refresh")
async def refresh(body: RefreshRequest, service: AuthService = Depends(get_auth_service)) -> Session:
    return await service.refresh(body.refresh_token)


@router.get("/me")
async def me(user: User = Depends(current_user)) -> User:
    return user


@router.patch("/me")
async def update_me(body: ProfileUpdate, user: User = Depends(current_user), service: AuthService = Depends(get_auth_service)) -> User:
    return await service.update_profile(user.id, body)


@router.post("/password", status_code=204)
async def change_password(body: PasswordChange, user: User = Depends(current_user), service: AuthService = Depends(get_auth_service)) -> Response:
    await service.change_password(user.id, body)
    return Response(status_code=204)
