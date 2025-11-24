from typing import Annotated, Set
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError

from app.core.config import settings
from app.core.db import AsyncSessionMaker, AsyncSession
from app.schemas.auth import TokenPayload
from app.models.rbac import User


bearer_scheme = HTTPBearer(description="Enter your access token", auto_error=False)


async def get_db() -> AsyncSession:
    async with AsyncSessionMaker() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_db)]


def _unauthenticated(detail: str = "Not authenticated"):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_bearer_token(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Security(bearer_scheme)
    ]
) -> str:
    if credentials is None or not credentials.credentials:
        _unauthenticated()
    
    if credentials.scheme.lower() != "bearer":
        _unauthenticated("Invalid authentication scheme")

    return credentials.credentials


TokenDep = Annotated[str, Depends(get_bearer_token)]


async def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    try:
        user_id = int(token_data.sub)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authentication subject",
        )

    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_permissions(required: Set[str]):
    def validator(user: CurrentUser):
        if not user.roles:
            raise HTTPException(403, "User role not assigned")

        user_perm_names: Set[str] = set()
        for role in user.roles:
            if role.permissions:
                user_perm_names.update(p.name for p in role.permissions)

        if not required.issubset(user_perm_names):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No permissions"
            )
        return user
    return validator


def has_permission(user: User | None, permission_name: str) -> bool:
    """Return True if `user` has a permission named `permission_name`.

    This helper compares permission names (strings) to the Role->Permission model
    relationships that are seeded/managed elsewhere in the application.
    """
    if not user or not getattr(user, "roles", None):
        return False

    perm_names: Set[str] = set()
    for role in user.roles:
        if role.permissions:
            perm_names.update(p.name for p in role.permissions)
    return permission_name in perm_names
