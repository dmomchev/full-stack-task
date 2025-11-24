from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from app.core.deps import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.user import UserService
from app.core.security import create_access_token
from app.core.config import settings


router = APIRouter(prefix="/login", tags=["Login"])


@router.post("/access-token", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = UserService(db)

    user = await service.authenticate(data.username, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    extra_claims = {}
    if user.roles:
        extra_claims["role"] = user.roles[0].name
    token = create_access_token(user.id, access_token_expires, extra_claims)

    return TokenResponse(access_token=token)
