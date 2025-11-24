from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.car.utils import serialize_paginated
from app.core.deps import get_db, require_permissions
from app.schemas.car import BrandCreate, BrandRead
from app.schemas.pagination import PaginatedResponse, PaginationParams
from app.services.car import BrandService


router = APIRouter(prefix="/brands", tags=["Brands"])


def get_brand_service(db: AsyncSession = Depends(get_db)) -> BrandService:
    return BrandService(db)


@router.post(
    "",
    response_model=BrandRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions({"cars:write"}))],
)
async def create_brand(
    data: BrandCreate,
    service: BrandService = Depends(get_brand_service),
):
    brand = await service.create(data)
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


@router.delete(
    "/{brand_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permissions({"cars:delete"}))],
)
async def delete_brand(
    brand_id: int,
    service: BrandService = Depends(get_brand_service),
):
    await service.delete(brand_id)
    return None

