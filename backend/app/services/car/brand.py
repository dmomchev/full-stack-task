from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import has_permission
from app.models.rbac import User
from app.repositories.car import CarRepository


class BrandService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    async def create(self, data, user: User):
        return await self.repo.create_brand(name=data.name, created_by=user.id)

    async def get(self, brand_id: int):
        brand = await self.repo.get_brand_by_id(brand_id)
        if not brand:
            raise HTTPException(404, "Brand not found")
        return brand

    async def list(self, page, per_page, sort_by, filters):
        return await self.repo.get_brands_paginated(page, per_page, sort_by, filters)

    async def delete(self, user: User, brand_id: int):
        brand = await self.repo.get_brand_by_id(brand_id)
        if not brand:
            raise HTTPException(404, "Brand not found")

        if has_permission(user, "cars:delete"):
            await self.repo.delete_brand(brand_id)
            return {"detail": "Brand deleted successfully"}

        if has_permission(user, "cars:delete_own"):
            if brand.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete brands you created"
                )
            await self.repo.delete_brand(brand_id)
            return {"detail": "Brand deleted successfully"}

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

    async def update(self, user: User, brand_id: int, data):
        brand = await self.repo.get_brand_by_id(brand_id)
        if not brand:
            raise HTTPException(404, "Brand not found")

        if has_permission(user, "cars:write"):
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return brand
            return await self.repo.update_brand(brand, **update_data)

        if has_permission(user, "cars:update_own"):
            if brand.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update brands you created"
                )
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return brand
            return await self.repo.update_brand(brand, **update_data)

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

