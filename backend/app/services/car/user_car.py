from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import has_permission
from app.models.rbac import User
from app.repositories.car import CarRepository


class UserCarService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    @staticmethod
    def _ensure_garage_permission(user: User):
        if not has_permission(user, "my_cars"):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No permission to manage garage")

    async def add(self, user: User, car_spec_id: int):
        self._ensure_garage_permission(user)
        car_spec = await self.repo.get_car_spec_by_id(car_spec_id)
        if not car_spec:
            raise HTTPException(404, "Car spec does not exist")

        return await self.repo.add_car_to_user_list(user.id, car_spec_id)

    async def remove(self, user: User, car_spec_id: int):
        self._ensure_garage_permission(user)
        await self.repo.remove_car_from_user_list(user.id, car_spec_id)
        return {"detail": "Car removed from user list"}

    async def list_my_cars(self, user: User, page, per_page, sort_by, filters):
        self._ensure_garage_permission(user)
        return await self.repo.get_user_cars_paginated(
            user.id,
            page,
            per_page,
            sort_by,
            filters
        )

