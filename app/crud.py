from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, delete
from app.models import University, Program
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

async def get_universities(db: AsyncSession, skip: int = 0, limit: int = 100):
    try:
        stmt = select(University).options(selectinload(University.programs)).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Ошибка в get_universities: {e}", exc_info=True)
        raise


async def get_university(db: AsyncSession, subjects: Optional[List[str]] = None, cities: Optional[List[str]] = None):
    try:
        stmt = select(University).options(selectinload(University.programs))

        if not subjects and not cities:
            result = await db.execute(stmt)
            return result.scalars().all()

        university_ids = None

        if subjects:
            subjects_stmt = select(Program.university_id).where(
                func.array_to_string(Program.required_subjects, ',').ilike(f"%{subjects}%")
            ).distinct()
            result = await db.execute(subjects_stmt)
            subjects_ids = {row[0] for row in result.all() if row[0]}
            university_ids = subjects_ids if university_ids is None else university_ids & subjects_ids

        if cities:
            # Проверяем города в массиве cities университета
            city_stmt = select(University.id).where(
                func.array_to_string(University.cities, ',').ilike(f"%{cities}%")
            )
            result = await db.execute(city_stmt)
            city_ids = {row[0] for row in result.all() if row[0]}
            university_ids = city_ids if university_ids is None else university_ids & city_ids

        if university_ids is not None and not university_ids:
            return []

        if university_ids is not None:
            stmt = stmt.where(University.id.in_(list(university_ids)))

        result = await db.execute(stmt)
        return result.scalars().all()

    except Exception as e:
        logger.error(f"Ошибка в get_university: {e}", exc_info=True)
        raise

async def add_university(db: AsyncSession, name: str, cities: Optional[List[str]] = None):
    try:
        db_university = University(name=name, cities=cities or [])
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
        stmt = delete(University).where(University.id == university_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка в delete_university: {e}", exc_info=True)
        raise

async def update_university(db: AsyncSession, university_id: int, name: str = None, cities: Optional[List[str]] = None):
    try:
        stmt = select(University).where(University.id == university_id)
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
        stmt = select(University).options(selectinload(University.programs)).where(University.id == university_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    except Exception as e:
        logger.error(f"Ошибка в get_university_by_id: {e}", exc_info=True)
        raise
