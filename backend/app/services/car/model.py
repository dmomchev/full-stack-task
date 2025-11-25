from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import has_permission
from app.models.rbac import User
from app.repositories.car import CarRepository


class ModelService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    async def create(self, brand_id: int, data, user: User):
        brand = await self.repo.get_brand_by_id(brand_id)
        if not brand:
            raise HTTPException(404, "Brand not found")

        return await self.repo.create_model(
            brand_id=brand_id,
            name=data.name,
            created_by=user.id
        )

    async def list_by_brand(self, brand_id: int, page, per_page, sort_by, filters):
        brand = await self.repo.get_brand_by_id(brand_id)
        if not brand:
            raise HTTPException(404, "Brand not found")

        return await self.repo.get_models_paginated(
            brand_id,
            page,
            per_page,
            sort_by,
            filters
        )

    async def delete(self, user: User, brand_id: int, model_id: int):
        model = await self.repo.get_model_by_id(model_id)
        if not model or model.brand_id != brand_id:
            raise HTTPException(404, "Model not found")

        if has_permission(user, "cars:delete"):
            await self.repo.delete_model(model_id)
            return {"detail": "Model deleted successfully"}

        if has_permission(user, "cars:delete_own"):
            if model.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete models you created"
                )
            await self.repo.delete_model(model_id)
            return {"detail": "Model deleted successfully"}

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

    async def get(self, brand_id: int, model_id: int):
        model = await self.repo.get_model_by_id(model_id)
        if not model or model.brand_id != brand_id:
            raise HTTPException(404, "Model not found")
        return model

    async def update(self, user: User, brand_id: int, model_id: int, data):
        model = await self.repo.get_model_by_id(model_id)
        if not model or model.brand_id != brand_id:
            raise HTTPException(404, "Model not found")

        if has_permission(user, "cars:write"):
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return model
            return await self.repo.update_model(model, **update_data)

        if has_permission(user, "cars:update_own"):
            if model.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update models you created"
                )
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return model
            return await self.repo.update_model(model, **update_data)

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

