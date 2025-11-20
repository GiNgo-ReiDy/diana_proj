from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uniapp.crud import get_university
from uniapp.database import get_session

router = APIRouter()  # ← именно router, а не функция

@router.get("")
async def api_search_universities(
    subjects: str | None = Query(None),
    city: str | None = Query(None),
    session: AsyncSession = Depends(get_session)
):
    universities = await get_university(
        session,
        subjects=[subjects] if subjects else None,
        cities=[city] if city else None,
    )
    return [
        {
            "id": u.id,
            "name": u.name,
            "cities": u.cities,
            "programs": [{"name": p.name, "required_subjects": p.required_subjects} for p in u.programs]
        }
        for u in universities
    ]
