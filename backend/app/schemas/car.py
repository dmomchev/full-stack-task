from typing import Optional
from pydantic import BaseModel, Field


# Base Schemas
class BrandBase(BaseModel):
    name: str = Field(..., max_length=100)

class ModelBase(BaseModel):
    brand_id: int
    name: str = Field(..., max_length=100)

class SubmodelBase(BaseModel):
    model_id: int
    name: str = Field(..., max_length=100)

class GenerationBase(BaseModel):
    submodel_id: int
    name: str = Field(..., max_length=100)
    year_start: Optional[int] = None
    year_end: Optional[int] = None

class CarSpecBase(BaseModel):
    generation_id: int
    engine: Optional[str] = Field(None, max_length=100)
    horsepower: Optional[int] = None
    torque: Optional[int] = None
    fuel_type: Optional[str] = Field(None, max_length=50)
    year: Optional[int] = None
    created_by: Optional[int] = None

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
    brand_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=100)

class SubmodelUpdate(BaseModel):
    model_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=100)

class GenerationUpdate(BaseModel):
    submodel_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=100)
    year_start: Optional[int] = None
    year_end: Optional[int] = None

class CarSpecUpdate(BaseModel):
    generation_id: Optional[int] = None
    engine: Optional[str] = Field(None, max_length=100)
    horsepower: Optional[int] = None
    torque: Optional[int] = None
    fuel_type: Optional[str] = Field(None, max_length=50)
    year: Optional[int] = None
    created_by: Optional[int] = None


# READ Schemas
class BrandRead(BrandBase):
    id: int

    class Config:
        from_attributes = True

class ModelRead(ModelBase):
    id: int

    class Config:
        from_attributes = True

class SubmodelRead(SubmodelBase):
    id: int

    class Config:
        from_attributes = True

class GenerationRead(GenerationBase):
    id: int

    class Config:
        from_attributes = True

class CarSpecRead(CarSpecBase):
    id: int

    class Config:
        from_attributes = True
        
class UserCarsRead(UserCarsBase):
    id: int