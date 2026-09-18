from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from app.core.database import users_collection
from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Extract and validate user from JWT Bearer token."""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject"
        )

    # Allow query by ObjectId or string/email fallback
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await users_collection.find_one({"email": user_id})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found"
        )

    user["id"] = str(user["_id"])
    return user

def require_role(*roles: str):
    """Role-Based Access Control (RBAC) dependency factory."""
    async def checker(user=Depends(get_current_user)):
        user_role = user.get("role", "creator").lower()
        allowed = [r.lower() for r in roles]
        if user_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(roles)}"
            )
        return user
    return checker
