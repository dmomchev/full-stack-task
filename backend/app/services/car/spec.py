from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import has_permission
from app.models.rbac import User
from app.repositories.car import CarRepository


class CarSpecService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    @staticmethod
    def _ensure_permission(user: User, permission: str):
        if not has_permission(user, permission):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

    async def create(self, generation_id: int, data, user: User):
        self._ensure_permission(user, "cars:write")
        generation = await self.repo.get_generation_by_id(generation_id)
        if not generation:
            raise HTTPException(404, "Generation not found")

        return await self.repo.create_car_spec(
            generation_id=generation_id,
            name=data.name,
            engine=data.engine,
            horsepower=data.horsepower,
            torque=data.torque,
            fuel_type=data.fuel_type,
            year=data.year,
            created_by=user.id,
        )

    async def list_by_generation(self, user: User, generation_id, page, per_page, sort_by, filters):
        self._ensure_permission(user, "cars:read")
        generation = await self.repo.get_generation_by_id(generation_id)
        if not generation:
            raise HTTPException(404, "Generation not found")

        return await self.repo.get_specs_paginated(
            generation_id,
            page,
            per_page,
            sort_by,
            filters
        )

    async def get(self, user: User, spec_id: int):
        self._ensure_permission(user, "cars:read")
        car = await self.repo.get_car_spec_by_id(spec_id)
        if not car:
            raise HTTPException(404, "Car spec not found")
        return car

    async def delete(self, user: User, generation_id: int, spec_id: int):
        spec = await self.repo.get_car_spec_by_id(spec_id)
        if not spec or spec.generation_id != generation_id:
            raise HTTPException(404, "Car spec not found")

        if has_permission(user, "cars:delete"):
            await self.repo.delete_car_spec(spec_id)
            return {"detail": "Car spec deleted successfully"}

        if has_permission(user, "cars:delete_own"):
            if spec.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete car specs you created"
                )
            await self.repo.delete_car_spec(spec_id)
            return {"detail": "Car spec deleted successfully"}

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

    async def update(self, user: User, generation_id: int, spec_id: int, data):
        spec = await self.repo.get_car_spec_by_id(spec_id)
        if not spec or spec.generation_id != generation_id:
            raise HTTPException(404, "Car spec not found")

        if has_permission(user, "cars:write"):
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return spec
            return await self.repo.update_car_spec(spec, **update_data)

        if has_permission(user, "cars:update_own"):
            if spec.created_by != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update car specs you created"
                )
            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return spec
            return await self.repo.update_car_spec(spec, **update_data)

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

