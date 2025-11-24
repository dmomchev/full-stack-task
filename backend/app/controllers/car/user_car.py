from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.models.rbac import User
from app.schemas.car import CarSpecRead, UserCarsRead
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import UserCarService


router = APIRouter(prefix="/my-cars", tags=["My Cars"])


def get_user_car_service(db: AsyncSession = Depends(get_db)) -> UserCarService:
    return UserCarService(db)


@router.post(
    "/{car_spec_id}",
    response_model=UserCarsRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_to_my_cars(
    car_spec_id: int,
    current_user: Annotated[User, Depends(require_permissions({"my_cars"}))],
    service: UserCarService = Depends(get_user_car_service),
):
    record = await service.add(current_user, car_spec_id)
    return UserCarsRead.model_validate(record)


@router.delete("/{car_spec_id}")
async def remove_from_my_cars(
    car_spec_id: int,
    current_user: Annotated[User, Depends(require_permissions({"my_cars"}))],
    service: UserCarService = Depends(get_user_car_service),
):
    return await service.remove(current_user, car_spec_id)


@router.get("", response_model=PaginatedResponse[CarSpecRead])
async def list_my_cars(
    current_user: Annotated[User, Depends(require_permissions({"my_cars"}))],
    params: PaginationParams = Depends(),
    service: UserCarService = Depends(get_user_car_service),
):
    result = await service.list_my_cars(
        current_user,
        params.page,
        params.per_page,
        params.sort_by,
        params.filters,
    )
    return serialize_paginated(result, CarSpecRead)

