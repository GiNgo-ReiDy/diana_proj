from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from pathlib import Path
from logging import getLogger

from app.database import get_session
from models import University, Program

router = APIRouter()
logger = getLogger(__name__)
BASE_DIR = Path(__file__).resolve().parent.parent  # путь к проекту
TEMPLATES_DIR = BASE_DIR / "app" / "templates"

# Настройка шаблонов
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@router.get("/", response_class=HTMLResponse)
async def search_universities(
        request: Request,
        program: str = Query(None),
        subjects: str = Query(None),
        city: str = Query(None),
        session: AsyncSession = Depends(get_session),
):
    logger.info("=" * 50)
    logger.info("ENDPOINT ВЫЗВАН!")
    logger.info(f"Запрос получен: program={program}, subjects={subjects}, city={city}")
    try:
        # Используем асинхронный запрос к базе данных
        stmt = select(University).options(selectinload(University.programs))

        # Применяем фильтры, если они указаны
        if program or subjects or city:
            # Если есть фильтры, используем подзапросы
            university_ids = None

            if program:
                program_stmt = select(Program.university_id).where(
                    Program.name.ilike(f"%{program}%")
                )
                result = await session.execute(program_stmt)
                program_ids = {row[0] for row in result.all() if row[0]}
                university_ids = program_ids if university_ids is None else university_ids & program_ids

            if subjects:
                # required_subjects - это массив, используем array_to_string для поиска
                subjects_stmt = select(Program.university_id).where(
                    func.array_to_string(Program.required_subjects, ',').ilike(f"%{subjects}%")
                )
                result = await session.execute(subjects_stmt)
                subjects_ids = {row[0] for row in result.all() if row[0]}
                university_ids = subjects_ids if university_ids is None else university_ids & subjects_ids

            if city:
                # Проверяем города в массиве cities университета
                # Для PostgreSQL ARRAY используем array_to_string для поиска
                city_stmt = select(University.id).where(
                    func.array_to_string(University.cities, ',').ilike(f"%{city}%")
                )
                result = await session.execute(city_stmt)
                city_ids = {row[0] for row in result.all() if row[0]}
                university_ids = city_ids if university_ids is None else university_ids & city_ids

            if university_ids is not None:
                if not university_ids:
                    # Нет совпадений
                    universities = []
                else:
                    stmt = stmt.where(University.id.in_(list(university_ids)))
                    result = await session.execute(stmt)
                    universities = result.scalars().all()
            else:
                # Нет фильтров, возвращаем все
                result = await session.execute(stmt)
                universities = result.scalars().all()
        else:
            # Нет фильтров, возвращаем все
            result = await session.execute(stmt)
            universities = result.scalars().all()

        logger.info(f"Найдено университетов: {len(universities)}")
        logger.info(f"Путь к шаблонам: {TEMPLATES_DIR}")
        logger.info("Формирую ответ...")
        response = templates.TemplateResponse("main.html", {
            "request": request,
            "universities": universities or []
        })
        logger.info("Ответ сформирован успешно, возвращаю...")
        return response
    except Exception as e:
        logger.error(f"Ошибка при получении университетов: {e}", exc_info=True)
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Полный traceback: {error_trace}")
        try:
            # пытаемся вернуть страницу с ошибкой
            return templates.TemplateResponse("main.html", {
                "request": request,
                "universities": [],
                "error": f"Ошибка при загрузке данных: {str(e)}"
            })
        except Exception as e2:
            # если даже шаблон не может быть отрендерен, возвращаем простой текст
            logger.error(f"Критическая ошибка при рендеринге шаблона: {e2}", exc_info=True)
            return HTMLResponse(content=f"<h1>Критическая ошибка:</h1><p>{str(e)}</p>", status_code=500)


@router.get("/admin", response_class=HTMLResponse)
async def admin_panel(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})


@router.get("/admin_auth", response_class=HTMLResponse)
async def admin_auth_panel(request: Request):
    return templates.TemplateResponse("admin_auth.html", {"request": request})

