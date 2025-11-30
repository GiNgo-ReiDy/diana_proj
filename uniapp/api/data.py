import logging
from fastapi import APIRouter, Query, Depends, Body, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uniapp.crud import get_university, get_universities
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uniapp.database import get_session
from uniapp.models import UniversityDB, ProgramDB, SubjectsDB
from uniapp.schemas import SearchUniversitiesRequest

router = APIRouter()  # ← именно router, а не функция
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Основная функция поиска университетов
@router.post("/search-universities/")
async def search_universities(request: SearchUniversitiesRequest, session: AsyncSession = Depends(get_session)):
    """
    Роутер для поиска университетов и программ по заданным критериям.
    """
    logger.debug(f"Received request: {request.dict()}")
    # Получаем результаты через CRUD-функцию
    results = await get_university(session, subjects=request.subjects, cities=request.cities)
    return results

@router.get("/all")
async def api_get_all_universities(
    session: AsyncSession = Depends(get_session)
):
    universities = await get_universities(session)
    return [
        {
            "id": u.id,
            "name": u.name,
            "cities": u.cities,
        }
        for u in universities
    ]

@router.post("/add")
async def api_add_university(
    name: str = Body(...),
    cities: list[str] | None = Body(None),
    session: AsyncSession = Depends(get_session)
):
    from uniapp.crud import add_university

    university = await add_university(session, name, cities)
    return {
        "id": university.id,
        "name": university.name,
        "cities": university.cities,
        "programs": []
    }

@router.delete("/delete/{university_id}")
async def api_delete_university(
    university_id: int,
    session: AsyncSession = Depends(get_session)
):
    from uniapp.crud import delete_university

    deleted = await delete_university(session, university_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"University with id {university_id} not found.")
    return {"status": "success", "message": f"University with id {university_id} deleted."}

@router.put("/update/{university_id}")
async def api_update_university(
    university_id: int,
    name: str | None = Body(None),
    cities: list[str] | None = Body(None),
    session: AsyncSession = Depends(get_session)
):
    from uniapp.crud import update_university

    university = await update_university(session, university_id, name, cities)
    if university is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"University with id {university_id} not found."
        )

    return {
        "id": university.id,
        "name": university.name,
        "cities": university.cities,
        "programs": [
            {
                "name": p.name,
                "mask_required_all": p.mask_required_all,
                "mask_required_any": p.mask_required_any,
                "university_id": p.university_id
            }
            for p in university.programs
        ]
    }

