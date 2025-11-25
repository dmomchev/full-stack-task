from typing import Optional
from pydantic import BaseModel, Field


# Base Schemas
class BrandBase(BaseModel):
    name: str = Field(..., max_length=100)


class ModelBase(BaseModel):
    name: str = Field(..., max_length=100)


class SubmodelBase(BaseModel):
    name: str = Field(..., max_length=100)


class GenerationBase(BaseModel):
    name: str = Field(..., max_length=100)
    year_start: int
    year_end: int


class CarSpecBase(BaseModel):
    name: str = Field(..., max_length=100)
    engine: str = Field(..., max_length=100)
    horsepower: int
    torque: int
    fuel_type: str = Field(..., max_length=50)
    year: int


class UserCarsBase(BaseModel):
    user_id: int
    car_spec_id: int


# CREATE Schemas
class BrandCreate(BrandBase):
    pass


class ModelCreate(ModelBase):
    pass


class SubmodelCreate(SubmodelBase):
    pass


class GenerationCreate(GenerationBase):
    pass


class CarSpecCreate(CarSpecBase):
    pass


class UserCarsCreate(UserCarsBase):
    pass


# UPDATE Schemas
class BrandUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)


class ModelUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)


class SubmodelUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)


class GenerationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    year_start: Optional[int] = None
    year_end: Optional[int] = None


class CarSpecUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    engine: Optional[str] = Field(None, max_length=100)
    horsepower: Optional[int] = None
    torque: Optional[int] = None
    fuel_type: Optional[str] = Field(None, max_length=50)
    year: Optional[int] = None


# READ Schemas
class BrandRead(BrandBase):
    id: int

    class Config:
        from_attributes = True


class ModelRead(ModelBase):
    id: int
    brand_id: int

    class Config:
        from_attributes = True


class SubmodelRead(SubmodelBase):
    id: int
    model_id: int

    class Config:
        from_attributes = True


class GenerationRead(GenerationBase):
    id: int
    submodel_id: int

    class Config:
        from_attributes = True


class CarSpecRead(CarSpecBase):
    id: int
    generation_id: int
    created_by: int

    class Config:
        from_attributes = True


class UserCarsRead(UserCarsBase):
    id: int

    class Config:
        from_attributes = True