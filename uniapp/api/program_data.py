from fastapi import APIRouter, Query, Depends, Body, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uniapp.crud import get_programs, update_program
from uniapp.database import get_session
from typing import Optional, List

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

@router.patch("/update/{program_id}")
async def api_update_program(
        program_id : int,
        required_subjects: Optional[List[str]] = Body(None),  # Список новых предметов
        university_id: Optional[int] = Body(None),  # Новый ID университета
        session: AsyncSession = Depends(get_session)
):
    from uniapp.crud import update_program
    program = await update_program(session, program_id, required_subjects, university_id)

    if program is None:
        raise HTTPException(status_code=404, detail="Программа с ID {program_id}} не найдена")

    return {
        "id": program.id,
        "required_subjects": program.required_subjects,
        "university_id": program.university_id
    }
