from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.deps import get_db, require_permissions
from app.services.role import RoleService
from app.schemas.role import RoleResponse, PermissionResponse

router = APIRouter(prefix="/roles", tags=["Roles"])


def get_role_service(db: AsyncSession = Depends(get_db)):
    return RoleService(db)


@router.get(
    "",
    response_model=List[RoleResponse],
    dependencies=[Depends(require_permissions({"users:crud"}))],
)
async def list_roles(service: RoleService = Depends(get_role_service)):
    return await service.get_roles()


@router.get(
    "/{role_id}/permissions",
    response_model=List[PermissionResponse],
    dependencies=[Depends(require_permissions({"users:crud"}))],
)
async def list_role_permissions(role_id: int, service: RoleService = Depends(get_role_service)):
    return await service.get_role_permissions(role_id)

