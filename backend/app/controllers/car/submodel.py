from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.schemas.car import SubmodelCreate, SubmodelRead
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import SubmodelService


router = APIRouter(prefix="/models/{model_id}/submodels", tags=["Submodels"])


def get_submodel_service(db: AsyncSession = Depends(get_db)) -> SubmodelService:
    return SubmodelService(db)


@router.post(
    "",
    response_model=SubmodelRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions({"cars:write"}))],
)
async def create_submodel(
    model_id: int,
    data: SubmodelCreate,
    service: SubmodelService = Depends(get_submodel_service),
):
    payload = SubmodelCreate(model_id=model_id, name=data.name)
    submodel = await service.create(payload)
    return SubmodelRead.model_validate(submodel)


@router.get(
    "",
    response_model=PaginatedResponse[SubmodelRead],
    dependencies=[Depends(require_permissions({"cars:read"}))],
)
async def list_submodels(
    model_id: int,
    params: PaginationParams = Depends(),
    service: SubmodelService = Depends(get_submodel_service),
):
    result = await service.list_by_model(model_id, params.page, params.per_page, params.sort_by, params.filters)
    return serialize_paginated(result, SubmodelRead)

