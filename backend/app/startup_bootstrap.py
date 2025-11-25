from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.rbac import Permission, Role, User
from app.core.db import AsyncSessionMaker


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSessionMaker() as session:
        await session.run_sync(ensure_seed_data_sync) #async not working here
    yield

DEFAULT_PERMISSIONS = [
    ("users:crud", "Manage users"),
    ("cars:write", "Create and update car data"),
    ("cars:update_own", "Update own car data"),
    ("cars:delete", "Delete any car data"),
    ("cars:delete_own", "Delete own car data"),
    ("cars:read", "Read car data"),
    ("my_cars", "Manage personal garage"),
]

ROLE_MATRIX = {
    "Admin": {"users:crud", "cars:write", "cars:delete", "cars:read", "my_cars"},
    "CarSpec": {"cars:write", "cars:update_own", "cars:delete_own", "cars:read"},
    "User": {"cars:read", "my_cars"},
}


def ensure_seed_data_sync(session: Session) -> None:
    perm_lookup = {}
    for name, description in DEFAULT_PERMISSIONS:
        stmt = select(Permission).where(Permission.name == name)
        perm = session.execute(stmt).scalar_one_or_none()
        if not perm:
            perm = Permission(name=name, description=description)
            session.add(perm)
            session.flush()
        perm_lookup[name] = perm

    for role_name, permissions in ROLE_MATRIX.items():
        stmt = select(Role).where(Role.name == role_name).options(selectinload(Role.permissions))
        role = session.execute(stmt).scalar_one_or_none()
        if not role:
            role = Role(name=role_name)
            session.add(role)
            session.flush()
        role.permissions = [perm_lookup[name] for name in permissions]

    stmt = select(User).where(User.username == "admin")
    admin = session.execute(stmt).scalar_one_or_none()
    if not admin:
        admin = User(
            username="admin",
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            is_active=True,
        )
        role_stmt = select(Role).where(Role.name == "Admin")
        admin_role = session.execute(role_stmt).scalar_one()
        admin.roles = [admin_role]
        session.add(admin)

    session.commit()