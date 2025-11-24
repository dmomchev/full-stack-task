from pydantic import BaseModel, Field
from typing import Optional


# Base shared user fields
class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = Field(default=None, min_length=6)


class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True   # allows returning SQLAlchemy models directly
