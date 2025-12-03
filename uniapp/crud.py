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
):
    """
    Сервисная функция для поиска университетов и программ по заданным критериям.
    Возвращает удобный для пользователя результат с расшифрованными предметами.
    """
    try:
        # Начинаем построение основного SQL-запроса
        stmt = select(UniversityDB).options(selectinload(UniversityDB.programs))

        # Фильтрация по городам
        if cities:
            stmt = stmt.filter(UniversityDB.cities.overlap(cities))

        # Получаем уникальные университеты
        result = await db.execute(stmt)
        unique_universities = result.scalars().unique().all()

        # Если нет критериев фильтрации — вернуть все университеты
        if not subjects and not cities:
            return unique_universities

        # Подготавливаем фильтр программ по предметам
        programs_stmt = select(ProgramDB).where(ProgramDB.university_id.in_([u.id for u in unique_universities]))

        if subjects:
            # Преобразуем введённые предметы в битовую маску
            user_subjects_mask = subjects_to_mask(subjects)

            # Проверяем, что выбранные предметы присутствуют либо среди обязательных, либо среди дополнительных
            programs_stmt = programs_stmt.filter(
                ((ProgramDB.mask_required_all.op('|')(ProgramDB.mask_required_any)).op('&')(
                    user_subjects_mask)) == user_subjects_mask
            )

        # Запрашиваем подходящие программы
        programs_result = await db.execute(programs_stmt)
        filtered_programs = programs_result.scalars().all()

        # Формируем результирующие данные
        results = {}
        for program in filtered_programs:
            university_name = next(u.name for u in unique_universities if u.id == program.university_id)
            if university_name not in results:
                results[university_name] = {
                    "cities": program.university.cities,
                    "programs": []
                }

            # Конвертируем маски в удобочитаемые списки предметов
            required_all_names = ", ".join(mask_to_subjects(program.mask_required_all))
            required_any_names = ", ".join(mask_to_subjects(program.mask_required_any))

            results[university_name]["programs"].append({
                "id": program.id,
                "name": program.name,
                "required_all": required_all_names,
                "required_any": required_any_names,
                "program_url": program.program_url
            })

        return results
    except Exception as e:
        await db.rollback()
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


# Битовые маски для предметов
SUBJECTS = {
    "Биология": 1 << 0,
    "География": 1 << 1,
    "Иностранный язык": 1 << 2,
    "Информатика и ИКТ": 1 << 3,
    "История": 1 << 4,
    "Литература": 1 << 5,
    "Профильная математика": 1 << 6,
    "Обществознание": 1 << 7,
    "Русский язык": 1 << 8,
    "Физика": 1 << 9,
    "Химия": 1 << 10,
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
    program_url: str,
    university_id: int
):
    try:
        # Создаем новую программу
        db_program = ProgramDB(
            name=name,
            mask_required_all=required_all,
            mask_required_any=required_any,
            program_url=program_url,
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
    program_url: Optional[str] = None,
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
        if program_url is not None:
            values["program_url"] = program_url
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

