from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, delete
from uniapp.models import UniversityDB, ProgramDB
from typing import List, Optional
import logging


logger = logging.getLogger(__name__)

async def get_universities(db: AsyncSession, skip: int = 0, limit: int = 100):
    try:
        stmt = select(UniversityDB).options(selectinload(UniversityDB.programs)).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Ошибка в get_universities: {e}", exc_info=True)
        raise


async def get_university(
    db: AsyncSession,
    subjects: Optional[List[str]] = None,
    cities: Optional[List[str]] = None
) -> List[UniversityDB]:
    try:
        stmt = select(UniversityDB).options(selectinload(UniversityDB.programs))

        # Если нет фильтров — вернуть все университеты
        if not subjects and not cities:
            result = await db.execute(stmt)
            return result.scalars().all()

        university_ids: Optional[set[int]] = None

        # Фильтр по предметам
        if subjects:
            subjects_stmt = select(ProgramDB.university_id).where(
                # Ищем хотя бы один совпадающий предмет в required_subjects
                func.array_to_string(ProgramDB.required_subjects, ',').ilike(
                    '|'.join([f"%{s}%" for s in subjects])
                )
            ).distinct()
            result = await db.execute(subjects_stmt)
            subjects_ids = {row[0] for row in result.all() if row[0] is not None}
            university_ids = subjects_ids if university_ids is None else university_ids & subjects_ids

        # Фильтр по городам
        if cities:
            city_stmt = select(UniversityDB.id).where(
                func.array_to_string(UniversityDB.cities, ',').ilike(
                    '|'.join([f"%{c}%" for c in cities])
                )
            )
            result = await db.execute(city_stmt)
            city_ids = {row[0] for row in result.all() if row[0] is not None}
            university_ids = city_ids if university_ids is None else university_ids & city_ids

        # Если фильтры применялись, но пересечение пустое
        if university_ids is not None and not university_ids:
            return []

        # Применяем фильтр по найденным id
        if university_ids is not None:
            stmt = stmt.where(UniversityDB.id.in_(list(university_ids)))

        result = await db.execute(stmt)
        return result.scalars().all()

    except Exception as e:
        logger.error(f"Ошибка в get_university: {e}", exc_info=True)
        raise

async def add_university(db: AsyncSession, name: str, cities: Optional[List[str]] = None):
    try:
        db_university = UniversityDB(name=name, cities=cities or [])
        db.add(db_university)
        await db.commit()
        await db.refresh(db_university)
        return db_university
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка в add_university: {e}", exc_info=True)
        raise

async def delete_university(db: AsyncSession, university_id: int):
    try:
        stmt = delete(UniversityDB).where(UniversityDB.id == university_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка в delete_university: {e}", exc_info=True)
        raise

async def update_university(db: AsyncSession,
                            university_id: int,
                            name: Optional[str] = None,
                            cities: Optional[List[str]] = None):
    try:
        stmt = (
            select(UniversityDB)
            .options(selectinload(UniversityDB.programs))
            .where(UniversityDB.id == university_id)
        )
        result = await db.execute(stmt)
        db_university = result.scalar_one_or_none()

        if db_university:
            if name:
                db_university.name = name
            if cities is not None:
                updated_cities = set(db_university.cities).union(set(cities))
                db_university.cities = sorted(list(updated_cities))

            await db.commit()
            await db.refresh(db_university)
            return db_university

        return None

    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка в update_university: {e}", exc_info=True)
        raise


async def get_university_by_id(db: AsyncSession, university_id: int):
    try:
        stmt = select(UniversityDB).options(selectinload(UniversityDB.programs)).where(UniversityDB.id == university_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    except Exception as e:
        logger.error(f"Ошибка в get_university_by_id: {e}", exc_info=True)
        raise

# Функции для программ

from sqlalchemy.ext.asyncio import AsyncSession
from uniapp.models import ProgramDB

# Битовые маски для предметов
SUBJECTS = {
    "math": 1 << 0,
    "russian": 1 << 1,
    "physics": 1 << 2,
    "informatics": 1 << 3,
    "chemistry": 1 << 4,
    "biology": 1 << 5,
    "geography": 1 << 6,
    "literature": 1 << 7,
    "history": 1 << 8,
    "social": 1 << 9,
    "english": 1 << 10,
    "profilmath": 1 << 11,
    "obzh": 1 << 12,
    # добавь остальные до 15
}

def subjects_to_mask(subject_list: list[str]) -> int:
    mask = 0
    for s in subject_list:
        if s in SUBJECTS:
            mask |= SUBJECTS[s]
    return mask

async def add_program(db: AsyncSession, name: str, subjects: list[str], uniid: int):
    mask = subjects_to_mask(subjects)
    db_program = ProgramDB(
        name=name,
        university_id=uniid,
        mask_required_all=mask,
        mask_required_any=0  # пока без OR-предметов
    )
    db.add(db_program)
    await db.commit()
    await db.refresh(db_program)
    return db_program

# ---- Получить все программы ----
async def get_programs(db: AsyncSession):
    result = await db.execute(select(ProgramDB))
    return result.scalars().all()

# ---- Обновить программу ----
async def update_program(
    db: AsyncSession,
    program_id: int,
    required_all: List[int] = None,
    required_any: List[int] = None,
    university_id: int = None
):
    stmt = update(ProgramDB).where(ProgramDB.id == program_id)
    values = {}
    if required_all is not None:
        values["mask_required_all"] = make_mask(required_all)
    if required_any is not None:
        values["mask_required_any"] = make_mask(required_any)
    if university_id is not None:
        values["university_id"] = university_id
    if not values:
        return None
    stmt = stmt.values(**values).returning(ProgramDB)
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one_or_none()

# ---- Удалить программу ----
async def delete_program(db: AsyncSession, program_id: int):
    stmt = delete(ProgramDB).where(ProgramDB.id == program_id)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0

# ---- Фильтр по маске ----
async def filter_programs(db: AsyncSession, user_mask: int):
    query = select(ProgramDB).where(
        (user_mask.op("&")(ProgramDB.mask_required_all) == ProgramDB.mask_required_all) &
        ((ProgramDB.mask_required_any == 0) |
         (user_mask.op("&")(ProgramDB.mask_required_any) != 0))
    )
    result = await db.execute(query)
    return result.scalars().all()

