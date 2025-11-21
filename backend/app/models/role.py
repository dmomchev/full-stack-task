from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255))
