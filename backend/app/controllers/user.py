from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, require_permissions
from app.services.user import UserService
from app.schemas.user import UserCreate, UserUpdate, UserResponse


router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service(db: AsyncSession = Depends(get_db)):
    return UserService(db)


@router.post(
    "",
    response_model=UserResponse,
    dependencies=[Depends(require_permissions({"users:crud"}))],
)
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


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(require_permissions({"users:crud"}))],
)
async def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(require_permissions({"users:crud"}))],
)
async def update_user(user_id: int, data: UserUpdate, service: UserService = Depends(get_user_service)):
    user = await service.update_user(user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_permissions({"users:crud"}))],
)
async def delete_user(user_id: int, service: UserService = Depends(get_user_service)):
    ok = await service.delete_user(user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}


@router.post(
    "/{user_id}/role",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_permissions({"users:crud"}))],
)
async def assign_role_to_user(
    user_id: int,
    role_name: str = Query(
        ...,
        min_length=1,
        description="Name of the role to assign. Allowed values: Admin, CarSpec, User",
    ),
    service: UserService = Depends(get_user_service),
):
    try:
        user = await service.assign_role(user_id, role_name)
    except ValueError as e:
        detail = str(e)
        status_code = 404 if "not found" in detail.lower() else 400
        raise HTTPException(status_code=status_code, detail=detail)

    return {"detail": "Role assigned"}
