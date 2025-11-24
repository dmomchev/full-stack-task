from sqlalchemy import asc, desc, text
from sqlalchemy.sql import Select
from typing import Dict, Any, Optional


def apply_sorting(query: Select, model, sort_by: Optional[str]):
    """
    sort_by example: "name,-id,year"
    """
    if not sort_by:
        return query

    fields = sort_by.split(",")

    for f in fields:
        f = f.strip()
        if not f:
            continue

        if f.startswith("-"):
            column = getattr(model, f[1:], None)
            if column is not None:
                query = query.order_by(desc(column))
        else:
            column = getattr(model, f, None)
            if column is not None:
                query = query.order_by(asc(column))

    return query


def apply_filters(query: Select, model, filters: Optional[str]):
    """
    filters example:
        "brand_id:1,year>2010,engine~=diesel"
    
    Supported:
        =, >, <, >=, <=, !=
        ~= (LIKE)
    """

    if not filters:
        return query

    rules = filters.split(",")

    for rule in rules:
        rule = rule.strip()
        if not rule:
            continue

        # LIKE filter
        if "~=" in rule:
            key, val = rule.split("~=", 1)
            column = getattr(model, key, None)
            if column is not None:
                query = query.where(column.ilike(f"%{val}%"))
            continue

        # comparison filters
        for op in [">=", "<=", "!=", ">", "<", ":"]:
            if op in rule:
                key, val = rule.split(op, 1)
                col = getattr(model, key, None)
                if col is None:
                    break

                if op == ":" or op == "=":
                    query = query.where(col == val)
                elif op == ">":
                    query = query.where(col > val)
                elif op == "<":
                    query = query.where(col < val)
                elif op == ">=":
                    query = query.where(col >= val)
                elif op == "<=":
                    query = query.where(col <= val)
                elif op == "!=":
                    query = query.where(col != val)
                break

    return query
