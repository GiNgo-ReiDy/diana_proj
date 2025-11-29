from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import update
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, delete, or_, and_
from uniapp.models import UniversityDB, ProgramDB, SubjectsDB
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
            # получаем ID предметов
            subject_ids_stmt = select(SubjectsDB.id).where(SubjectsDB.name.in_(subjects))
            result = await db.execute(subject_ids_stmt)
            subject_ids = [row[0] for row in result.all()]

            # строим маску
            required_mask = 0
            for sid in subject_ids:
                required_mask |= (1 << sid)

            subjects_stmt = select(ProgramDB.university_id).where(
                (ProgramDB.mask_required_all.op("&")(required_mask) == required_mask) |
                (ProgramDB.mask_required_any.op("&")(required_mask) != 0)
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

        return result.all()

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
                db_university.cities = cities

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
    "биология": 1 << 0,
    "география": 1 << 1,
    "иностранный язык": 1 << 2,
    "информатика": 1 << 3,
    "история": 1 << 4,
    "литература": 1 << 5,
    "профильная математика": 1 << 6,
    "обществознание": 1 << 7,
    "русский язык": 1 << 8,
    "физика": 1 << 9,
    "химия": 1 << 10,
}

def subjects_to_mask(subject_list: list[str]) -> int:
    mask = 0
    for s in subject_list:
        if s in SUBJECTS:
            mask |= SUBJECTS[s]
    return mask

def mask_to_subjects(mask: int) -> List[str]:
    subjects = []
    for subject_name, subject_bit in SUBJECTS.items():
        if mask & subject_bit:
            subjects.append(subject_name)
    return subjects

async def add_program(
    db: AsyncSession,
    name: str,
    required_all: int,
    required_any: int,
    university_id: int
):
    try:
        # Создаем новую программу
        db_program = ProgramDB(
            name=name,
            mask_required_all=required_all,
            mask_required_any=required_any,
            university_id=university_id
        )
        db.add(db_program)
        await db.commit()
        await db.refresh(db_program)
        return db_program
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка в add_program: {e}", exc_info=True)
        raise

# ---- Получить все программы ----
async def get_programs(db: AsyncSession):
    result = await db.execute(select(ProgramDB))
    return result.scalars().all()

# ---- Обновить программу ----
async def update_program(
    db: AsyncSession,
    program_id: int,
    required_all: Optional[int] = None,  # Ждёт именно готовую маску
    required_any: Optional[int] = None,  # Ждёт именно готовую маску
    university_id: Optional[int] = None
):
    try:
        stmt = update(ProgramDB).where(ProgramDB.id == program_id)
        values = {}
        if required_all is not None:
            values["mask_required_all"] = required_all  # Прямо присваиваем пришедшую маску
        if required_any is not None:
            values["mask_required_any"] = required_any  # Прямо присваиваем пришедшую маску
        if university_id is not None:
            values["university_id"] = university_id
        if not values:
            return None
        stmt = stmt.values(**values).returning(ProgramDB)
        result = await db.execute(stmt)
        await db.commit()
        return result.scalar_one_or_none()
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка в update_program: {e}", exc_info=True)
        raise

# ---- Удалить программу ----
async def delete_program(db: AsyncSession, program_id: int):
    try:
        stmt = delete(ProgramDB).where(ProgramDB.id == program_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка в delete_program: {e}", exc_info=True)
        raise

# ---- Фильтр по маске ----
async def filter_programs(db: AsyncSession, user_mask: int):
    try:
        query = select(ProgramDB).where(
            and_(
                (ProgramDB.mask_required_all.op("&")(user_mask)) == ProgramDB.mask_required_all,
                or_(
                    ProgramDB.mask_required_any == 0,
                    (ProgramDB.mask_required_any.op("&")(user_mask)) != 0
                )
            )
        )
        result = await db.execute(query)
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Ошибка в filter_programs: {e}", exc_info=True)
        raise

