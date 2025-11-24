from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import has_permission
from app.models.rbac import User
from app.repositories.car import CarRepository


class BrandService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    async def create(self, data):
        return await self.repo.create_brand(name=data.name)

    async def get(self, brand_id: int):
        brand = await self.repo.get_brand_by_id(brand_id)
        if not brand:
            raise HTTPException(404, "Brand not found")
        return brand

    async def list(self, page, per_page, sort_by, filters):
        return await self.repo.get_brands_paginated(page, per_page, sort_by, filters)

    async def delete(self, brand_id: int):
        await self.get(brand_id)
        await self.repo.delete_brand(brand_id)
        return {"detail": "Brand deleted successfully"}


class ModelService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    async def create(self, data):
        # Validate brand exists
        brand = await self.repo.get_brand_by_id(data.brand_id)
        if not brand:
            raise HTTPException(404, "Brand not found")

        return await self.repo.create_model(
            brand_id=data.brand_id,
            name=data.name
        )

    async def list_by_brand(self, brand_id: int, page, per_page, sort_by, filters):
        # Validate brand exists
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


class SubmodelService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    async def create(self, data):
        # Ensure parent model exists
        model = await self.repo.get_model_by_id(data.model_id)
        if not model:
            raise HTTPException(404, "Model not found")

        return await self.repo.create_submodel(
            model_id=data.model_id,
            name=data.name
        )

    async def list_by_model(self, model_id: int, page, per_page, sort_by, filters):
        # Validate model exists
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


class GenerationService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    async def create(self, data):
        # Check submodel exists
        submodel = await self.repo.get_submodel_by_id(data.submodel_id)
        if not submodel:
            raise HTTPException(404, "Submodel not found")

        return await self.repo.create_generation(
            submodel_id=data.submodel_id,
            name=data.name,
            year_start=data.year_start,
            year_end=data.year_end
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


class CarSpecService:
    def __init__(self, db: AsyncSession):
        self.repo = CarRepository(db)

    @staticmethod
    def _ensure_permission(user: User, permission: str):
        if not has_permission(user, permission):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")

    async def create(self, data, user: User):
        self._ensure_permission(user, "cars:write")
        # Validate generation
        generation = await self.repo.get_generation_by_id(data.generation_id)
        if not generation:
            raise HTTPException(404, "Generation not found")

        return await self.repo.create_car_spec(
            generation_id=data.generation_id,
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
