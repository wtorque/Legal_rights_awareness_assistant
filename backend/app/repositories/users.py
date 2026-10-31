"""File-backed user store (interim, see ADR-024). Files are named by random id; emails are looked up by scanning."""
import os
import re
from pathlib import Path

from app.core.exceptions import NotFound
from app.schemas.auth import StoredUser

_ID = re.compile(r"^[0-9a-f]{32}$")


class UserRepository:
    def __init__(self, root: Path) -> None:
        self.root = root

    def _path(self, user_id: str) -> Path:
        if not _ID.fullmatch(user_id):
            raise NotFound("User not found")
        return self.root / f"{user_id}.json"

    def save(self, user: StoredUser) -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        target = self._path(user.id)
        tmp = target.with_suffix(".json.tmp")
        tmp.write_text(user.model_dump_json(), encoding="utf-8")
        os.replace(tmp, target)

    def get(self, user_id: str) -> StoredUser | None:
        path = self._path(user_id)
        return StoredUser.model_validate_json(path.read_text(encoding="utf-8")) if path.is_file() else None

    def find_by_login(self, identifier: str) -> StoredUser | None:
        """Matches an email address or a username, case-insensitively."""
        if not self.root.is_dir():
            return None
        wanted = identifier.strip().lower()
        for path in self.root.glob("*.json"):
            user = StoredUser.model_validate_json(path.read_text(encoding="utf-8"))
            if wanted in (user.email, user.username):
                return user
        return None

    def find_by_email(self, email: str) -> StoredUser | None:
        wanted = email.strip().lower()
        user = self.find_by_login(wanted)
        return user if user and user.email == wanted else None
