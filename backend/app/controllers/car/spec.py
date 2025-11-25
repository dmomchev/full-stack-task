from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.models.rbac import User
from app.schemas.car import CarSpecCreate, CarSpecRead, CarSpecUpdate
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import CarSpecService


router = APIRouter(tags=["Car Specifications"])


def get_spec_service(db: AsyncSession = Depends(get_db)) -> CarSpecService:
    return CarSpecService(db)


@router.post(
    "/generations/{generation_id}/specs",
    response_model=CarSpecRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_car_spec(
    generation_id: int,
    data: CarSpecCreate,
    current_user: Annotated[User, Depends(require_permissions({"cars:write"}))],
    service: CarSpecService = Depends(get_spec_service),
):
    spec = await service.create(generation_id, data, current_user)
    return CarSpecRead.model_validate(spec)


@router.get(
    "/generations/{generation_id}/specs",
    response_model=PaginatedResponse[CarSpecRead],
)
async def list_car_specs(
    generation_id: int,
    current_user: Annotated[User, Depends(require_permissions({"cars:read"}))],
    params: PaginationParams = Depends(),
    service: CarSpecService = Depends(get_spec_service),
):
    result = await service.list_by_generation(
        current_user,
        generation_id,
        params.page,
        params.per_page,
        params.sort_by,
        params.filters,
    )
    return serialize_paginated(result, CarSpecRead)


@router.get("/specs/{spec_id}", response_model=CarSpecRead)
async def get_car_spec(
    spec_id: int,
    current_user: Annotated[User, Depends(require_permissions({"cars:read"}))],
    service: CarSpecService = Depends(get_spec_service),
):
    spec = await service.get(current_user, spec_id)
    return CarSpecRead.model_validate(spec)


@router.delete(
    "/generations/{generation_id}/specs/{spec_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_car_spec(
    generation_id: int,
    spec_id: int,
    current_user: Annotated[User, Depends(require_permissions({"cars:delete"}))],
    service: CarSpecService = Depends(get_spec_service),
):
    return await service.delete(current_user, generation_id, spec_id)


@router.put(
    "/generations/{generation_id}/specs/{spec_id}",
    response_model=CarSpecRead,
)
async def update_car_spec(
    generation_id: int,
    spec_id: int,
    data: CarSpecUpdate,
    current_user: Annotated[User, Depends(require_permissions({"cars:write"}))],
    service: CarSpecService = Depends(get_spec_service),
):
    spec = await service.update(current_user, generation_id, spec_id, data)
    return CarSpecRead.model_validate(spec)

