from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import has_permission
from app.models.rbac import User
from app.repositories.car import CarRepository


class SubmodelService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    async def create(self, model_id: int, data, user: User):
        model = await self.repo.get_model_by_id(model_id)
        if not model:
            raise HTTPException(404, "Model not found")

        return await self.repo.create_submodel(
            model_id=model_id,
            name=data.name,
            created_by=user.id
        )

    async def list_by_model(self, model_id: int, page, per_page, sort_by, filters):
        model = await self.repo.get_model_by_id(model_id)
        if not model:
            raise HTTPException(404, "Model not found")

        return await self.repo.get_submodels_paginated(
            model_id,
            page,
            per_page,
            sort_by,
            filters
        )

    async def delete(self, user: User, model_id: int, submodel_id: int):
        submodel = await self.repo.get_submodel_by_id(submodel_id)
        if not submodel or submodel.model_id != model_id:
            raise HTTPException(404, "Submodel not found")

        if has_permission(user, "cars:delete"):
            await self.repo.delete_submodel(submodel_id)
            return {"detail": "Submodel deleted successfully"}

        if has_permission(user, "cars:delete_own"):
            if submodel.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete submodels you created"
                )
            await self.repo.delete_submodel(submodel_id)
            return {"detail": "Submodel deleted successfully"}

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

    async def get(self, model_id: int, submodel_id: int):
        submodel = await self.repo.get_submodel_by_id(submodel_id)
        if not submodel or submodel.model_id != model_id:
            raise HTTPException(404, "Submodel not found")
        return submodel

    async def update(self, user: User, model_id: int, submodel_id: int, data):
        submodel = await self.repo.get_submodel_by_id(submodel_id)
        if not submodel or submodel.model_id != model_id:
            raise HTTPException(404, "Submodel not found")

        if has_permission(user, "cars:write"):
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return submodel
            return await self.repo.update_submodel(submodel, **update_data)

        if has_permission(user, "cars:update_own"):
            if submodel.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update submodels you created"
                )
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return submodel
            return await self.repo.update_submodel(submodel, **update_data)

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

