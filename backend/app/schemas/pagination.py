from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 10
    sort_by: Optional[str] = None       # example: "name,-id"
    filters: Optional[str] = None       # example: "brand_id:1,year>2010"


class PageMeta(BaseModel):
    page: int
    per_page: int
    total_items: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    meta: PageMeta
