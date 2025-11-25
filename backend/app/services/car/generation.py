from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import has_permission
from app.models.rbac import User
from app.repositories.car import CarRepository


class GenerationService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    async def create(self, submodel_id: int, data, user: User):
        # Check submodel exists
        submodel = await self.repo.get_submodel_by_id(submodel_id)
        if not submodel:
            raise HTTPException(404, "Submodel not found")

        return await self.repo.create_generation(
            submodel_id=submodel_id,
            name=data.name,
            year_start=data.year_start,
            year_end=data.year_end,
            created_by=user.id
        )

    async def list_by_submodel(self, submodel_id, page, per_page, sort_by, filters):
        submodel = await self.repo.get_submodel_by_id(submodel_id)
        if not submodel:
            raise HTTPException(404, "Submodel not found")

        return await self.repo.get_generations_paginated(
            submodel_id,
            page,
            per_page,
            sort_by,
            filters
        )

    async def delete(self, user: User, submodel_id: int, generation_id: int):
        generation = await self.repo.get_generation_by_id(generation_id)
        if not generation or generation.submodel_id != submodel_id:
            raise HTTPException(404, "Generation not found")

        if has_permission(user, "cars:delete"):
            await self.repo.delete_generation(generation_id)
            return {"detail": "Generation deleted successfully"}

        if has_permission(user, "cars:delete_own"):
            if generation.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete generations you created"
                )
            await self.repo.delete_generation(generation_id)
            return {"detail": "Generation deleted successfully"}

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

    async def get(self, submodel_id: int, generation_id: int):
        generation = await self.repo.get_generation_by_id(generation_id)
        if not generation or generation.submodel_id != submodel_id:
            raise HTTPException(404, "Generation not found")
        return generation

    async def update(self, user: User, submodel_id: int, generation_id: int, data):
        generation = await self.repo.get_generation_by_id(generation_id)
        if not generation or generation.submodel_id != submodel_id:
            raise HTTPException(404, "Generation not found")

        if has_permission(user, "cars:write"):
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return generation
            return await self.repo.update_generation(generation, **update_data)

        if has_permission(user, "cars:update_own"):
            if generation.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update generations you created"
                )
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return generation
            return await self.repo.update_generation(generation, **update_data)

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

