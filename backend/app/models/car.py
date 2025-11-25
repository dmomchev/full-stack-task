from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.db import Base


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)


class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)


class Submodel(Base):
    __tablename__ = "submodels"

    id = Column(Integer, primary_key=True)
    model_id = Column(Integer, ForeignKey("models.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)


class Generation(Base):
    __tablename__ = "generations"

    id = Column(Integer, primary_key=True)
    submodel_id = Column(Integer, ForeignKey("submodels.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)
    year_start = Column(Integer, nullable=False)
    year_end = Column(Integer, nullable=False)


class CarSpec(Base):
    __tablename__ = "car_specs"

    id = Column(Integer, primary_key=True)
    generation_id = Column(Integer, ForeignKey("generations.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)
    engine = Column(String(100), nullable=False)
    horsepower = Column(Integer, nullable=False)
    torque = Column(Integer, nullable=False)
    fuel_type = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)


class UserCars(Base):
    __tablename__ = "user_cars"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_spec_id = Column(Integer, ForeignKey("car_specs.id", ondelete="CASCADE"))