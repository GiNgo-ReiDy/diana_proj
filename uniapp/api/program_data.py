from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uniapp.crud import get_programs, add_program, update_program, delete_program, filter_programs
from uniapp.database import get_session
from pydantic import BaseModel


router = APIRouter()

# ---- GET все программы ----
@router.get("/all")
async def api_get_all_programs(session: AsyncSession = Depends(get_session)):
    programs = await get_programs(session)
    return [
        {
            "id": p.id,
            "name": p.name,
            "mask_required_all": p.mask_required_all,
            "mask_required_any": p.mask_required_any,
            "program_url": p.program_url,
            "university_id": p.university_id
        } for p in programs
    ]


class ProgramCreate(BaseModel):
    name: str
    required_all: int  # Битовая маска обязательных предметов
    required_any: int  # Битовая маска факультативных предметов
    program_url: str
    university_id: int

@router.post("/add")
async def api_add_program(
    payload: ProgramCreate = Body(...),
    session: AsyncSession = Depends(get_session)
):
    # Проверяем, что хотя бы одна из масок присутствует
    if payload.required_all == 0 and payload.required_any == 0:
        raise HTTPException(status_code=400, detail="Необходимо указать хотя бы один предмет")

    # Создаем программу с передачей битовых масок
    program = await add_program(
        db=session,
        name=payload.name,
        required_all=payload.required_all,
        required_any=payload.required_any,
        program_url=payload.program_url,
        university_id=payload.university_id
    )

    return {
        "id": program.id,
        "name": program.name,
        "mask_required_all": program.mask_required_all,
        "mask_required_any": program.mask_required_any,
        "program_url":program.program_url,
        "university_id": program.university_id
    }

# ---- DELETE удалить программу ----
@router.delete("/delete/{program_id}")
async def api_delete_program(program_id: int, session: AsyncSession = Depends(get_session)):
    deleted = await delete_program(session, program_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Program not found")
    return {"status": "success", "message": f"Program {program_id} deleted"}

# ---- PATCH обновить программу ----
@router.patch("/update/{program_id}")
async def api_update_program(
    program_id: int,
    required_all: int = Body(None),
    required_any: int = Body(None),
    program_url: str = Body(None),
    university_id: int = Body(None),
    session: AsyncSession = Depends(get_session)
):
    program = await update_program(session, program_id, required_all, required_any, program_url, university_id)
    if program is None:
        raise HTTPException(status_code=404, detail=f"Программа {program_id} не найдена.")
    return {
        "id": program.id,
        "mask_required_all": program.mask_required_all,
        "mask_required_any": program.mask_required_any,
        "program_url":program.program_url,
        "university_id": program.university_id
    }


