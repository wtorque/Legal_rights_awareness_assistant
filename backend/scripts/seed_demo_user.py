"""Creates a local demo account: username `torque`, password `torque`.

For development only. The password is deliberately short, so the script refuses to run when APP_ENV=production.
Run from backend/:  python -m scripts.seed_demo_user
"""
import uuid
from datetime import UTC, datetime

from app.core.config import get_settings
from app.core.security import hash_password
from app.repositories.users import UserRepository
from app.schemas.auth import StoredUser

USERNAME = "torque"
PASSWORD = "torque"
EMAIL = "torque@example.com"


def main() -> None:
    settings = get_settings()
    if settings.app_env == "production":
        raise SystemExit("Refusing to create a demo account with a weak password in production.")
    repo = UserRepository(settings.users_dir)
    existing = repo.find_by_login(USERNAME)
    user = StoredUser(
        id=existing.id if existing else uuid.uuid4().hex, email=EMAIL, username=USERNAME, name="Torque",
        created_at=existing.created_at if existing else datetime.now(UTC), password_hash=hash_password(PASSWORD),
    )
    repo.save(user)
    print(f"{'Updated' if existing else 'Created'} demo account: username={USERNAME} password={PASSWORD}")


if __name__ == "__main__":
    main()
