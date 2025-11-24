from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.models.rbac import User
from app.schemas.car import CarSpecCreate, CarSpecRead
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import CarSpecService


router = APIRouter(tags=["Car Specs"])


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
    payload = CarSpecCreate(
        generation_id=generation_id,
        engine=data.engine,
        horsepower=data.horsepower,
        torque=data.torque,
        fuel_type=data.fuel_type,
        year=data.year,
    )
    spec = await service.create(payload, current_user)
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

