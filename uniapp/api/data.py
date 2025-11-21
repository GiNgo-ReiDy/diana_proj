from fastapi import APIRouter, Query, Depends, Body, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uniapp.crud import get_university, get_universities
from uniapp.database import get_session

router = APIRouter()  # ← именно router, а не функция

@router.get("/get_universities")
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
            "programs": [{"name": p.name, "required_subjects": p.required_subjects} for p in u.programs]
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"University with id {university_id} not found.")
    return {
        "id": university.id,
        "name": university.name,
        "cities": university.cities,
        "programs": [{"name": p.name, "required_subjects": p.required_subjects} for p in university.programs]
    }

