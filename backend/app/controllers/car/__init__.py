from fastapi import APIRouter

from .brand import router as brand_router
from .model import router as model_router
from .submodel import router as submodel_router
from .generation import router as generation_router
from .spec import router as spec_router
from .user_car import router as user_car_router


car_routers: list[APIRouter] = [
    brand_router,
    model_router,
    submodel_router,
    generation_router,
    spec_router,
    user_car_router,
]

__all__ = ["car_routers"]

