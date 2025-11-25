from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.models.rbac import User
from app.schemas.car import SubmodelCreate, SubmodelRead, SubmodelUpdate
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import SubmodelService


router = APIRouter(prefix="/models/{model_id}/submodels", tags=["Submodels"])


def get_submodel_service(db: AsyncSession = Depends(get_db)) -> SubmodelService:
    return SubmodelService(db)


@router.post(
    "",
    response_model=SubmodelRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_submodel(
    model_id: int,
    data: SubmodelCreate,
    current_user: Annotated[User, Depends(require_permissions({"cars:write"}))],
    service: SubmodelService = Depends(get_submodel_service),
):
    submodel = await service.create(model_id, data, current_user)
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


@router.get(
    "/{submodel_id}",
    response_model=SubmodelRead,
    dependencies=[Depends(require_permissions({"cars:read"}))],
)
async def get_submodel(
    model_id: int,
    submodel_id: int,
    service: SubmodelService = Depends(get_submodel_service),
):
    submodel = await service.get(model_id, submodel_id)
    return SubmodelRead.model_validate(submodel)


@router.delete(
    "/{submodel_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_submodel(
    model_id: int,
    submodel_id: int,
    current_user: Annotated[User, Depends(require_permissions({"cars:delete"}, {"cars:delete_own"}))],
    service: SubmodelService = Depends(get_submodel_service),
):
    return await service.delete(current_user, model_id, submodel_id)


@router.put(
    "/{submodel_id}",
    response_model=SubmodelRead,
)
async def update_submodel(
    model_id: int,
    submodel_id: int,
    data: SubmodelUpdate,
    current_user: Annotated[User, Depends(require_permissions({"cars:write"}, {"cars:update_own"}))],
    service: SubmodelService = Depends(get_submodel_service),
):
    submodel = await service.update(current_user, model_id, submodel_id, data)
    return SubmodelRead.model_validate(submodel)

