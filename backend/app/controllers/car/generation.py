from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.schemas.car import GenerationCreate, GenerationRead
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import GenerationService


router = APIRouter(prefix="/submodels/{submodel_id}/generations", tags=["Generations"])


def get_generation_service(db: AsyncSession = Depends(get_db)) -> GenerationService:
    return GenerationService(db)


@router.post(
    "",
    response_model=GenerationRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions({"cars:write"}))],
)
async def create_generation(
    submodel_id: int,
    data: GenerationCreate,
    service: GenerationService = Depends(get_generation_service),
):
    payload = GenerationCreate(
        submodel_id=submodel_id,
        name=data.name,
        year_start=data.year_start,
        year_end=data.year_end,
    )
    generation = await service.create(payload)
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

