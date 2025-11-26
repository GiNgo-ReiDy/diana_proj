from fastapi import APIRouter, Query, Depends, Body, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uniapp.crud import get_programs
from uniapp.database import get_session

router = APIRouter()

@router.get("/all")
async def api_get_all_programs(
    session: AsyncSession = Depends(get_session)
):
    programs = await get_programs(session)
    return [
        {
            "id": p.id,
            "name": p.name,
            "required_subjects": p.required_subjects,
            "university_id": p.university_id,
        }
        for p in programs
    ]

@router.post("/add")
async def api_add_program(
    name: str = Body(...),
    subjects: list[str] = Body(...),
    uniid: int = Body(...),
    session: AsyncSession = Depends(get_session)
):

    from uniapp.crud import add_program

    program = await add_program(session, name, subjects, uniid)
    return{
        "id": program.id,
        "name": program.name,
        "required_subjects": program.required_subjects,
        "university_id": program.university_id,
    }

@router.delete("/delete/{program_id}")
async def api_del_program(
        program_id: int,
        session: AsyncSession = Depends(get_session)
):

    from uniapp.crud import delete_program
    deleted = await delete_program(session, program_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Program not found")
    return {"status": "success", "message": f"University with id {program_id} deleted."}

