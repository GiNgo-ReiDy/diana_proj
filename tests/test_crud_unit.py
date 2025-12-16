import pytest
import asyncio

from uniapp import crud
from uniapp.models import UniversityDB, ProgramDB


@pytest.mark.asyncio
async def test_add_university_returns_object(fake_db):
    # ensure commit/refresh do not raise
    result = await crud.add_university(fake_db, "Test Uni", ["City1"])
    assert isinstance(result, UniversityDB)
    assert result.name == "Test Uni"
    assert result.cities == ["City1"]


@pytest.mark.asyncio
async def test_delete_university_true_when_rowcount_positive(fake_db):
    fake_db.set_next_result([], rowcount=1)
    res = await crud.delete_university(fake_db, 1)
    assert res is True


@pytest.mark.asyncio
async def test_delete_university_false_when_no_rows(fake_db):
    fake_db.set_next_result([], rowcount=0)
    res = await crud.delete_university(fake_db, 999)
    assert res is False


@pytest.mark.asyncio
async def test_add_program_creates_program(fake_db):
    program = await crud.add_program(fake_db, name="Prog", required_all=1, required_any=0, program_url="/", university_id=1)
    assert isinstance(program, ProgramDB)
    assert program.name == "Prog"


@pytest.mark.asyncio
async def test_get_programs_returns_list(fake_db):
    p = ProgramDB()
    p.id = 1
    p.name = "P1"
    fake_db.set_next_result([p])
    res = await crud.get_programs(fake_db)
    assert isinstance(res, list)
    assert res[0].name == "P1"


@pytest.mark.asyncio
async def test_filter_programs_filters_by_mask(fake_db):
    p1 = ProgramDB()
    p1.id = 1
    p1.mask_required_all = 1
    p1.mask_required_any = 0
    fake_db.set_next_result([p1])
    res = await crud.filter_programs(fake_db, user_mask=1)
    assert isinstance(res, list)


@pytest.mark.asyncio
async def test_update_program_returns_none_when_no_values(fake_db):
    # passing no updatable values
    res = await crud.update_program(fake_db, program_id=1)
    assert res is None


@pytest.mark.asyncio
async def test_delete_program_true_false(fake_db):
    fake_db.set_next_result([], rowcount=1)
    ok = await crud.delete_program(fake_db, 1)
    assert ok is True
    fake_db.set_next_result([], rowcount=0)
    nok = await crud.delete_program(fake_db, 999)
    assert nok is False
