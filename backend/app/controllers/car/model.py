from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.schemas.car import ModelCreate, ModelRead, ModelUpdate
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import ModelService


router = APIRouter(prefix="/brands/{brand_id}/models", tags=["Models"])


def get_model_service(db: AsyncSession = Depends(get_db)) -> ModelService:
    return ModelService(db)


@router.post(
    "",
    response_model=ModelRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions({"cars:write"}))],
)
async def create_model(
    brand_id: int,
    data: ModelCreate,
    service: ModelService = Depends(get_model_service),
):
    model = await service.create(brand_id, data)
    return ModelRead.model_validate(model)


@router.get(
    "",
    response_model=PaginatedResponse[ModelRead],
    dependencies=[Depends(require_permissions({"cars:read"}))],
)
async def list_models(
    brand_id: int,
    params: PaginationParams = Depends(),
    service: ModelService = Depends(get_model_service),
):
    result = await service.list_by_brand(brand_id, params.page, params.per_page, params.sort_by, params.filters)
    return serialize_paginated(result, ModelRead)


@router.get(
    "/{model_id}",
    response_model=ModelRead,
    dependencies=[Depends(require_permissions({"cars:read"}))],
)
async def get_model(
    brand_id: int,
    model_id: int,
    service: ModelService = Depends(get_model_service),
):
    model = await service.get(brand_id, model_id)
    return ModelRead.model_validate(model)


@router.delete(
    "/{model_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_permissions({"cars:delete"}))],
)
async def delete_model(
    brand_id: int,
    model_id: int,
    service: ModelService = Depends(get_model_service),
):
    return await service.delete(brand_id, model_id)


@router.put(
    "/{model_id}",
    response_model=ModelRead,
    dependencies=[Depends(require_permissions({"cars:write"}))],
)
async def update_model(
    brand_id: int,
    model_id: int,
    data: ModelUpdate,
    service: ModelService = Depends(get_model_service),
):
    model = await service.update(brand_id, model_id, data)
    return ModelRead.model_validate(model)

