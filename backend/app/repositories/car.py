from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.car import Brand, Model, Submodel, Generation, CarSpec, UserCars
from app.utils.paginate import paginate


class CarRepository:
    """
    Repository for all Car-related models with CRUD + pagination.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    # ====================================================================
    # BRAND OPERATIONS
    # ====================================================================

    async def create_brand(self, name: str) -> Brand:
        brand = Brand(name=name)
        self.db.add(brand)
        await self.db.commit()
        await self.db.refresh(brand)
        return brand

    async def get_brand_by_id(self, brand_id: int) -> Optional[Brand]:
        result = await self.db.execute(select(Brand).where(Brand.id == brand_id))
        return result.scalar_one_or_none()

    async def get_all_brands(self) -> List[Brand]:
        result = await self.db.execute(select(Brand).order_by(Brand.name))
        return result.scalars().all()

    async def get_brands_paginated(self, page, per_page, sort_by, filters):
        return await paginate(
            session=self.db,
            model=Brand,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            filters=filters,
        )

    async def delete_brand(self, brand_id: int):
        await self.db.execute(delete(Brand).where(Brand.id == brand_id))
        await self.db.commit()

    # ====================================================================
    # MODEL OPERATIONS
    # ====================================================================

    async def create_model(self, brand_id: int, name: str) -> Model:
        model = Model(brand_id=brand_id, name=name)
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        return model

    async def get_model_by_id(self, model_id: int) -> Optional[Model]:
        result = await self.db.execute(select(Model).where(Model.id == model_id))
        return result.scalar_one_or_none()

    async def get_models_by_brand_id(self, brand_id: int) -> List[Model]:
        query = select(Model).where(Model.brand_id == brand_id).order_by(Model.name)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_models_paginated(self, brand_id, page, per_page, sort_by, filters):
        base_query = select(Model).where(Model.brand_id == brand_id)
        return await paginate(
            session=self.db,
            model=Model,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            filters=filters,
            base_query=base_query,
        )

    # ====================================================================
    # SUBMODEL OPERATIONS
    # ====================================================================

    async def create_submodel(self, model_id: int, name: str) -> Submodel:
        submodel = Submodel(model_id=model_id, name=name)
        self.db.add(submodel)
        await self.db.commit()
        await self.db.refresh(submodel)
        return submodel

    async def get_submodel_by_id(self, submodel_id: int) -> Optional[Submodel]:
        result = await self.db.execute(select(Submodel).where(Submodel.id == submodel_id))
        return result.scalar_one_or_none()

    async def get_submodels_by_model_id(self, model_id: int) -> List[Submodel]:
        query = select(Submodel).where(Submodel.model_id == model_id).order_by(Submodel.name)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_submodels_paginated(self, model_id, page, per_page, sort_by, filters):
        base_query = select(Submodel).where(Submodel.model_id == model_id)
        return await paginate(
            self.db,
            Submodel,
            page,
            per_page,
            sort_by,
            filters,
            base_query,
        )

    # ====================================================================
    # GENERATION OPERATIONS
    # ====================================================================

    async def create_generation(
        self, submodel_id: int, name: str,
        year_start: Optional[int] = None,
        year_end: Optional[int] = None
    ) -> Generation:
        generation = Generation(
            submodel_id=submodel_id,
            name=name,
            year_start=year_start,
            year_end=year_end
        )
        self.db.add(generation)
        await self.db.commit()
        await self.db.refresh(generation)
        return generation

    async def get_generation_by_id(self, generation_id: int) -> Optional[Generation]:
        result = await self.db.execute(select(Generation).where(Generation.id == generation_id))
        return result.scalar_one_or_none()

    async def get_generations_by_submodel_id(self, submodel_id: int) -> List[Generation]:
        query = select(Generation).where(Generation.submodel_id == submodel_id).order_by(Generation.year_start)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_generations_paginated(self, submodel_id, page, per_page, sort_by, filters):
        base_query = select(Generation).where(Generation.submodel_id == submodel_id)
        return await paginate(
            self.db,
            Generation,
            page,
            per_page,
            sort_by,
            filters,
            base_query,
        )

    # ====================================================================
    # CARSPEC OPERATIONS
    # ====================================================================

    async def create_car_spec(
        self,
        generation_id: int,
        engine: Optional[str] = None,
        horsepower: Optional[int] = None,
        torque: Optional[int] = None,
        fuel_type: Optional[str] = None,
        year: Optional[int] = None,
        created_by: Optional[int] = None
    ) -> CarSpec:
        spec = CarSpec(
            generation_id=generation_id,
            engine=engine,
            horsepower=horsepower,
            torque=torque,
            fuel_type=fuel_type,
            year=year,
            created_by=created_by
        )
        self.db.add(spec)
        await self.db.commit()
        await self.db.refresh(spec)
        return spec

    async def get_car_specs_by_generation_id(self, generation_id: int) -> List[CarSpec]:
        query = select(CarSpec).where(CarSpec.generation_id == generation_id).order_by(CarSpec.year)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_specs_paginated(self, generation_id, page, per_page, sort_by, filters):
        base_query = select(CarSpec).where(CarSpec.generation_id == generation_id)
        return await paginate(
            self.db,
            CarSpec,
            page,
            per_page,
            sort_by,
            filters,
            base_query,
        )

    async def get_car_spec_by_id(self, spec_id: int) -> Optional[CarSpec]:
        result = await self.db.execute(select(CarSpec).where(CarSpec.id == spec_id))
        return result.scalar_one_or_none()

    # ====================================================================
    # USER CARS (JOIN TABLE)
    # ====================================================================

    async def add_car_to_user_list(self, user_id: int, car_spec_id: int) -> UserCars:
        user_car = UserCars(user_id=user_id, car_spec_id=car_spec_id)
        self.db.add(user_car)
        await self.db.commit()
        await self.db.refresh(user_car)
        return user_car

    async def remove_car_from_user_list(self, user_id: int, car_spec_id: int):
        await self.db.execute(
            delete(UserCars).where(
                (UserCars.user_id == user_id) & (UserCars.car_spec_id == car_spec_id)
            )
        )
        await self.db.commit()

    async def get_cars_by_user_id(self, user_id: int) -> List[CarSpec]:
        query = (
            select(CarSpec)
            .join(UserCars, CarSpec.id == UserCars.car_spec_id)
            .where(UserCars.user_id == user_id)
            .order_by(CarSpec.year)
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_user_cars_paginated(self, user_id, page, per_page, sort_by, filters):
        base_query = (
            select(CarSpec)
            .join(UserCars, UserCars.car_spec_id == CarSpec.id)
            .where(UserCars.user_id == user_id)
        )

        return await paginate(
            self.db,
            CarSpec,
            page,
            per_page,
            sort_by,
            filters,
            base_query=base_query,
        )
