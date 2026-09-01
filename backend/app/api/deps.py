from typing import Optional, List
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import settings
from app.core.security import security
from app.db.session import users_collection

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def check_role(user: dict, allowed_roles: List[str]):
    if user.get("role") not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
