from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, delete
from uniapp.models import UniversityDB, ProgramDB
from typing import List, Optional
import logging

from uniapp.schemas import Program

logger = logging.getLogger(__name__)

async def get_universities(db: AsyncSession, skip: int = 0, limit: int = 100):
    try:
        stmt = select(UniversityDB).options(selectinload(UniversityDB.programs)).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Ошибка в get_universities: {e}", exc_info=True)
        raise


async def get_university(db: AsyncSession, subjects: Optional[List[str]] = None, cities: Optional[List[str]] = None):
    try:
        stmt = select(UniversityDB).options(selectinload(UniversityDB.programs))

        if not subjects and not cities:
            result = await db.execute(stmt)
            return result.scalars().all()

        university_ids = None

        if subjects:
            subjects_stmt = select(ProgramDB.university_id).where(
                func.array_to_string(ProgramDB.required_subjects, ',').ilike(f"%{subjects}%")
            ).distinct()
            result = await db.execute(subjects_stmt)
            subjects_ids = {row[0] for row in result.all() if row[0]}
            university_ids = subjects_ids if university_ids is None else university_ids & subjects_ids

        if cities:
            # Проверяем города в массиве cities университета
            city_stmt = select(UniversityDB.id).where(
                func.array_to_string(UniversityDB.cities, ',').ilike(f"%{cities}%")
            )
            result = await db.execute(city_stmt)
            city_ids = {row[0] for row in result.all() if row[0]}
            university_ids = city_ids if university_ids is None else university_ids & city_ids

        if university_ids is not None and not university_ids:
            return []

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

async def get_programs(db: AsyncSession, skip: int = 0, limit: int = 100):
    try:
        stmt = select(ProgramDB).options(selectinload(ProgramDB.university)).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Ошибка в get_programs: {e}", exc_info=True)
        raise

async def add_program(db: AsyncSession, name:str, subjects: List[str], uniid:int):
    try:
        if not name.strip():
            raise ValueError("Имя программы не может быть пустым.")
        if len(subjects) == 0:
            raise ValueError("Необходимо указать хотя бы один предмет.")
        if uniid <= 0:
            raise ValueError("Идентификатор университета должен быть положительным числом.")

        db_program = ProgramDB(name=name, required_subjects=subjects, university_id=uniid)
        db.add(db_program)
        await db.commit()
        await db.refresh(db_program)
        return db_program
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка в add_program: {e}", exc_info=True)
        raise

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