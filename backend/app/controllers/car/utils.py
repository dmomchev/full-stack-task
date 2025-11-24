from typing import Type, TypeVar

from pydantic import BaseModel

from app.schemas.pagination import PaginatedResponse


SchemaT = TypeVar("SchemaT", bound=BaseModel)


def serialize_paginated(
    result: PaginatedResponse, schema: Type[SchemaT]
) -> PaginatedResponse:
    """Convert ORM objects in `data` to the provided read schema."""
    return PaginatedResponse(
        data=[schema.model_validate(item) for item in result.data],
        meta=result.meta,
    )

