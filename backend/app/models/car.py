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
    year_start = Column(Integer)
    year_end = Column(Integer)


class CarSpec(Base):
    __tablename__ = "car_specs"

    id = Column(Integer, primary_key=True)
    generation_id = Column(Integer, ForeignKey("generations.id", ondelete="CASCADE"))
    engine = Column(String(100))
    horsepower = Column(Integer)
    torque = Column(Integer)
    fuel_type = Column(String(50))
    year = Column(Integer)
    created_by = Column(Integer, ForeignKey("users.id"))


class UserCars(Base):
    __tablename__ = "user_cars"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_spec_id = Column(Integer, ForeignKey("car_specs.id", ondelete="CASCADE"))