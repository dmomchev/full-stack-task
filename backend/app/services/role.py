from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.repositories.role import RoleRepository
from app.models.rbac import Role, Permission


class RoleService:
    def __init__(self, db: AsyncSession):
        self.roles = RoleRepository(db)

    async def create_role(self, name: str, description: str = None) -> Role:
        existing = await self.roles.get_by_name(name)
        if existing:
            raise ValueError("Role already exists")
        return await self.roles.create(name, description)

    async def get_role(self, role_id: int) -> Role:
        return await self.roles.get_by_id(role_id)

    async def get_roles(self) -> List[Role]:
        return await self.roles.get_all()

    async def delete_role(self, role_id: int) -> bool:
        role = await self.roles.get_by_id(role_id)
        if not role:
            return False
        await self.roles.delete(role)
        return True

    async def get_role_permissions(self, role_id: int) -> List[Permission]:
        return await self.roles.get_permissions(role_id)
