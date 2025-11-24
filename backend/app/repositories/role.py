from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.rbac import Role, Permission, role_permissions_table, user_roles_table


class RoleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, role_id: int) -> Optional[Role]:
        """Retrieve a role by its ID."""
        result = await self.db.execute(select(Role).where(Role.id == role_id))
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Role]:
        """Retrieve a role by its unique name."""
        result = await self.db.execute(select(Role).where(Role.name == name))
        return result.scalar_one_or_none()

    async def get_all(self) -> List[Role]:
        """Retrieve all roles."""
        result = await self.db.execute(select(Role))
        return result.scalars().all()

    async def create(self, name: str, description: str = None) -> Role:
        """Create a new role."""
        role = Role(name=name, description=description)
        self.db.add(role)
        await self.db.commit()
        await self.db.refresh(role)
        return role

    async def delete(self, role: Role):
        """Delete an existing role."""
        await self.db.delete(role)
        await self.db.commit()


    # Permission assignment (Role to Permission)
    async def assign_permission(self, role_id: int, permission_id: int):
        """Assign a permission to a role using the role_permissions_table."""
        await self.db.execute(
            role_permissions_table.insert().values(
                role_id=role_id,
                permission_id=permission_id
            )
        )
        await self.db.commit()

    async def remove_permission(self, role_id: int, permission_id: int):
        """Remove a permission from a role using the role_permissions_table."""
        await self.db.execute(
            role_permissions_table.delete().where(
                (role_permissions_table.c.role_id == role_id) &
                (role_permissions_table.c.permission_id == permission_id)
            )
        )
        await self.db.commit()

    async def get_permissions(self, role_id: int) -> List[Permission]:
        """Retrieve all permissions assigned to a specific role."""
        query = (
            select(Permission)
            .join(role_permissions_table)
            .where(role_permissions_table.c.role_id == role_id)
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def assign_user_to_role(self, user_id: int, role_id: int):
        """Assign a user to a role using the user_roles_table."""
        await self.db.execute(
            user_roles_table.insert().values(
                user_id=user_id,
                role_id=role_id
            )
        )
        await self.db.commit()

    async def remove_user_from_role(self, user_id: int, role_id: int):
        """Remove a user from a role using the user_roles_table."""
        await self.db.execute(
            user_roles_table.delete().where(
                (user_roles_table.c.user_id == user_id) &
                (user_roles_table.c.role_id == role_id)
            )
        )
        await self.db.commit()

    async def user_has_role(self, user_id: int, role_id: int) -> bool:
        """Check if a user already has a specific role assignment."""
        query = (
            select(user_roles_table.c.user_id)
            .where(
                (user_roles_table.c.user_id == user_id) &
                (user_roles_table.c.role_id == role_id)
            )
            .limit(1)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None