from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.schemas.car import ModelCreate, ModelRead
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
    payload = ModelCreate(brand_id=brand_id, name=data.name)
    model = await service.create(payload)
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

