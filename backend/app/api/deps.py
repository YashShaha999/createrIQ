from app.utils.dependencies import get_current_user, require_role
from fastapi import HTTPException

def check_role(user: dict, allowed_roles: list):
    if user.get("role") not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

__all__ = ["get_current_user", "require_role", "check_role"]
