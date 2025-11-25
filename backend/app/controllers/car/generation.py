from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.models.rbac import User
from app.schemas.car import GenerationCreate, GenerationRead, GenerationUpdate
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import GenerationService


router = APIRouter(prefix="/submodels/{submodel_id}/generations", tags=["Generations"])


def get_generation_service(db: AsyncSession = Depends(get_db)) -> GenerationService:
    return GenerationService(db)


@router.post(
    "",
    response_model=GenerationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_generation(
    submodel_id: int,
    data: GenerationCreate,
    current_user: Annotated[User, Depends(require_permissions({"cars:write"}))],
    service: GenerationService = Depends(get_generation_service),
):
    generation = await service.create(submodel_id, data, current_user)
    return GenerationRead.model_validate(generation)


@router.get(
    "",
    response_model=PaginatedResponse[GenerationRead],
    dependencies=[Depends(require_permissions({"cars:read"}))],
)
async def list_generations(
    submodel_id: int,
    params: PaginationParams = Depends(),
    service: GenerationService = Depends(get_generation_service),
):
    result = await service.list_by_submodel(
        submodel_id,
        params.page,
        params.per_page,
        params.sort_by,
        params.filters,
    )
    return serialize_paginated(result, GenerationRead)


@router.get(
    "/{generation_id}",
    response_model=GenerationRead,
    dependencies=[Depends(require_permissions({"cars:read"}))],
)
async def get_generation(
    submodel_id: int,
    generation_id: int,
    service: GenerationService = Depends(get_generation_service),
):
    generation = await service.get(submodel_id, generation_id)
    return GenerationRead.model_validate(generation)


@router.delete(
    "/{generation_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_generation(
    submodel_id: int,
    generation_id: int,
    current_user: Annotated[User, Depends(require_permissions({"cars:delete"}, {"cars:delete_own"}))],
    service: GenerationService = Depends(get_generation_service),
):
    return await service.delete(current_user, submodel_id, generation_id)


@router.put(
    "/{generation_id}",
    response_model=GenerationRead,
)
async def update_generation(
    submodel_id: int,
    generation_id: int,
    data: GenerationUpdate,
    current_user: Annotated[User, Depends(require_permissions({"cars:write"}, {"cars:update_own"}))],
    service: GenerationService = Depends(get_generation_service),
):
    generation = await service.update(current_user, submodel_id, generation_id, data)
    return GenerationRead.model_validate(generation)

