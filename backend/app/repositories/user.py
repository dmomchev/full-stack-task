from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.rbac import User
from app.utils.paginate import paginate


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        query = select(User).where(User.id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        query = select(User).where(User.username == username)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_users_paginated(self, page, per_page, sort_by, filters):
        return await paginate(
            session=self.db,
            model=User,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            filters=filters,
        )

    async def create_user(self, username: str, password: str) -> User:
        hashed_pw = get_password_hash(password)
        new_user = User(username=username, hashed_password=hashed_pw)

        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        return new_user

    async def update_user(self, user: User, **kwargs):
        for key, value in kwargs.items():
            if key == "password":
                setattr(user, "hashed_password", get_password_hash(value))
            else:
                setattr(user, key, value)

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete_user(self, user: User) -> None:
        await self.db.delete(user)
        await self.db.commit()
