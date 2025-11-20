from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import get_university
from app.database import get_session

router = APIRouter()  # ← именно router, а не функция

@router.get("/")
async def api_search_universities(
    program: str | None = Query(None),
    subjects: str | None = Query(None),
    city: str | None = Query(None),
    session: AsyncSession = Depends(get_session)
):
    universities = await get_university(session, program=program, subjects=subjects, city=city)
    return [
        {
            "id": u.id,
            "name": u.name,
            "cities": u.cities,
            "programs": [{"name": p.name, "required_subjects": p.required_subjects} for p in u.programs]
        }
        for u in universities
    ]
