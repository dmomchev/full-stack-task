from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.models.rbac import User
from app.schemas.car import BrandCreate, BrandRead, BrandUpdate
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import BrandService


router = APIRouter(prefix="/brands", tags=["Brands"])


def get_brand_service(db: AsyncSession = Depends(get_db)) -> BrandService:
    return BrandService(db)


@router.post(
    "",
    response_model=BrandRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_brand(
    data: BrandCreate,
    current_user: Annotated[User, Depends(require_permissions({"cars:write"}))],
    service: BrandService = Depends(get_brand_service),
):
    brand = await service.create(data, current_user)
    return BrandRead.model_validate(brand)


@router.get(
    "",
    response_model=PaginatedResponse[BrandRead],
    dependencies=[Depends(require_permissions({"cars:read"}))],
)
async def list_brands(
    params: PaginationParams = Depends(),
    service: BrandService = Depends(get_brand_service),
):
    result = await service.list(params.page, params.per_page, params.sort_by, params.filters)
    return serialize_paginated(result, BrandRead)


@router.get(
    "/{brand_id}",
    response_model=BrandRead,
    dependencies=[Depends(require_permissions({"cars:read"}))],
)
async def get_brand(
    brand_id: int,
    service: BrandService = Depends(get_brand_service),
):
    brand = await service.get(brand_id)
    return BrandRead.model_validate(brand)


@router.delete(
    "/{brand_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_brand(
    brand_id: int,
    current_user: Annotated[User, Depends(require_permissions({"cars:delete"}, {"cars:delete_own"}))],
    service: BrandService = Depends(get_brand_service),
):
    return await service.delete(current_user, brand_id)


@router.put(
    "/{brand_id}",
    response_model=BrandRead,
)
async def update_brand(
    brand_id: int,
    data: BrandUpdate,
    current_user: Annotated[User, Depends(require_permissions({"cars:write"}, {"cars:update_own"}))],
    service: BrandService = Depends(get_brand_service),
):
    brand = await service.update(current_user, brand_id, data)
    return BrandRead.model_validate(brand)

