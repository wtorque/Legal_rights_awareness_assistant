import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.core.logging import redact


def test_production_requires_strong_jwt_secret():
    with pytest.raises(ValidationError):
        Settings(app_env="production", jwt_secret="short")


def test_production_rejects_wildcard_cors():
    with pytest.raises(ValidationError):
        Settings(app_env="production", jwt_secret="x" * 40, cors_origins=["*"])


def test_redact_masks_pii_and_tokens():
    out = redact("mail a@b.com Bearer abc.def.ghi id 123456789012")
    assert "a@b.com" not in out and "abc.def.ghi" not in out and "123456789012" not in out
