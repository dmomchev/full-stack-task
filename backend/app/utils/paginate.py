from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Type

from app.utils.query_builder import apply_filters, apply_sorting
from app.schemas.pagination import PaginatedResponse, PageMeta


async def paginate(
    session: AsyncSession,
    model: Type,
    page: int,
    per_page: int,
    sort_by: Optional[str],
    filters: Optional[str],
    base_query=None,
):
    """
    Generic SQL pagination for any model.
    base_query: optional custom select() with joins
    """

    # Default select
    query = base_query if base_query is not None else select(model)

    # Apply filtering and sorting
    query = apply_filters(query, model, filters)
    query = apply_sorting(query, model, sort_by)

    # ---------------------------------------
    # Count total items
    # ---------------------------------------
    count_query = select(func.count()).select_from(query.subquery())
    total_items = (await session.execute(count_query)).scalar_one()

    # ---------------------------------------
    # Pagination LIMIT/OFFSET
    # ---------------------------------------
    paginated_query = query.limit(per_page).offset((page - 1) * per_page)

    result = await session.execute(paginated_query)
    items = result.scalars().all()

    # ---------------------------------------
    # Build response
    # ---------------------------------------
    return PaginatedResponse(
        data=items,
        meta=PageMeta(
            page=page,
            per_page=per_page,
            total_items=total_items,
            total_pages=(total_items + per_page - 1) // per_page,
        ),
    )
