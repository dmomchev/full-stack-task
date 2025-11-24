from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user import UserRepository
from app.repositories.role import RoleRepository
from app.models.rbac import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import verify_password


class UserService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)
        self.roles = RoleRepository(db)

    async def register(self, data: UserCreate) -> User:
        existing = await self.repo.get_by_username(data.username)
        if existing:
            raise ValueError("username already in use")

        return await self.repo.create_user(
            username=data.username,
            password=data.password
        )

    # Authentication (username + password)
    async def authenticate(self, username: str, password: str) -> Optional[User]:
        user = await self.repo.get_by_username(username)
        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    # CRUD
    async def get_user(self, user_id: int) -> Optional[User]:
        return await self.repo.get_by_id(user_id)

    async def get_users(self, skip: int =0, limit: int=100) -> List[User]:
        return await self.repo.get_all(skip, limit)

    async def update_user(self, user_id: int, data: UserUpdate) -> Optional[User]:
        user = await self.repo.get_by_id(user_id)
        if not user:
            return None

        update_data = data.model_dump(exclude_unset=True)

        return await self.repo.update_user(user, **update_data)

    async def delete_user(self, user_id: int) -> bool:
        user = await self.repo.get_by_id(user_id)
        if not user:
            return False

        await self.repo.delete_user(user)
        return True

    async def assign_role(self, user_id: int, role_name: str) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        role = await self.roles.get_by_name(role_name)
        if not role:
            raise ValueError("Role not found")

        # Avoid duplicate assignments
        if await self.roles.user_has_role(user_id, role.id):
            return user

        await self.roles.assign_user_to_role(user_id, role.id)
        # Refresh user to include updated roles relationship
        return await self.repo.get_by_id(user_id)
