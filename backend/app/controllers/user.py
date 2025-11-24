from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import (
    CurrentUser,
    get_db,
    has_permission,
    require_permissions,
)
from app.models.rbac import User
from app.services.user import UserService
from app.schemas.user import UserCreate, UserUpdate, UserResponse


router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service(db: AsyncSession = Depends(get_db)):
    return UserService(db)


@router.post("", response_model=UserResponse)
async def create_user(data: UserCreate, service: UserService = Depends(get_user_service)):
    try:
        user = await service.register(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return user


@router.get(
    "",
    response_model=list[UserResponse],
    dependencies=[Depends(require_permissions({"users:crud"}))],
)
async def list_users(
    skip: int = 0,
    limit: int = 100,
    service: UserService = Depends(get_user_service),
):
    return await service.get_users(skip, limit)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: CurrentUser,
    service: UserService = Depends(get_user_service),
):
    if current_user.id != user_id and not has_permission(current_user, "users:crud"):
        raise HTTPException(status_code=403, detail="Not authorized to view this user")
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: CurrentUser,
    service: UserService = Depends(get_user_service),
):
    if current_user.id != user_id and not has_permission(current_user, "users:crud"):
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    user = await service.update_user(user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(require_permissions({"users:crud"})),
):
    ok = await service.delete_user(user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return None
