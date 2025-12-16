import pytest
import asyncio
from typing import Any, List

from uniapp.app import app
from uniapp.database import get_session
from uniapp.models import ProgramDB, UniversityDB


class FakeResult:
    def __init__(self, items: List[Any] | Any = None, rowcount: int = 0):
        self._items = items if items is not None else []
        self.rowcount = rowcount

    def scalars(self):
        return self

    def unique(self):
        return self

    def all(self):
        return list(self._items)

    def scalar_one_or_none(self):
        if isinstance(self._items, list):
            return self._items[0] if self._items else None
        return self._items

    def returning(self, *args, **kwargs):
        return self


class FakeAsyncSession:
    def __init__(self):
        # default behavior: no rows
        self._next_result = FakeResult([])

    def set_next_result(self, items: List[Any] | Any, rowcount: int = 0):
        self._next_result = FakeResult(items, rowcount=rowcount)

    async def execute(self, *args, **kwargs):
        return self._next_result

    def add(self, obj: Any):
        # emulate SQLAlchemy session.add
        pass

    async def commit(self):
        return None

    async def refresh(self, obj: Any):
        return None

    async def rollback(self):
        return None


@pytest.fixture
def fake_db():
    return FakeAsyncSession()


@pytest.fixture
def client(fake_db):
    # override DB dependency to use fake session (sync override is OK)
    def _override_get_session():
        yield fake_db

    app.dependency_overrides[get_session] = _override_get_session

    from fastapi.testclient import TestClient

    with TestClient(app) as tc:
        yield tc
