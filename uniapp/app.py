from importlib.metadata import distribution
from sqlalchemy import or_
from fastapi import APIRouter, Request, Depends, Query, FastAPI
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload, Session
from pathlib import Path
from logging import getLogger
from typing import List, Optional

from sqlmodel import distinct

from uniapp.database import get_session
from uniapp.models import UniversityDB, ProgramDB, SubjectsDB
from uniapp.api.data import router as data_router
from uniapp.api.auth import router as auth_router
from uniapp.api.program_data import router as program_router

app = FastAPI()
logger = getLogger(__name__)
BASE_DIR = Path(__file__).resolve().parent.parent  # путь к проекту
TEMPLATES_DIR = BASE_DIR / "uniapp" / "templates"
app.mount("/static", StaticFiles(directory="uniapp/static"), name="static")

# Настройка шаблонов
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

app.include_router(data_router, prefix="/api/universities", tags=["data"])
app.include_router(program_router, prefix="/api/program", tags=["program_data"])
app.include_router(auth_router, prefix="/api", tags=["auth"])


@app.get("/", response_class=HTMLResponse)
async def search_universities(
        request: Request,
        subjects: Optional[List[str]] = None,
        cities: Optional[List[str]] = None,
        session: AsyncSession = Depends(get_session),
):
    logger.info("=" * 50)
    logger.info("ENDPOINT ВЫЗВАН!")
    logger.info(f"Запрос получен: subjects={subjects}, city={cities}")
    try:
        # Используем асинхронный запрос к базе данных
        stmt = select(UniversityDB).options(selectinload(UniversityDB.programs))

        university_ids = set()
        if subjects or cities:

            if subjects:
                conditions = [
                    ProgramDB.required_subjects.contains(subject) for subject in subjects
                ]
                subjects_stmt = select(distinct(ProgramDB.university_id)).filter(*conditions)
                result = await session.execute(subjects_stmt)
                subjects_ids = {row[0] for row in result.all()}
                university_ids.update(subjects_ids)

            if cities:
                city_conditions = [
                    func.array_to_string(UniversityDB.cities, ',').ilike(f"%{city}%" for city in cities)
                ]
                city_stmt = select(UniversityDB.id).where(or_(*city_conditions))
                result = await session.execute(city_stmt)
                city_ids = {row[0] for row in result.all()}
                university_ids.update(city_ids)

            if university_ids:
                stmt = stmt.where(UniversityDB.id.in_(list(university_ids)))
                result = await session.execute(stmt)
                universities = result.scalars().all()
            else:
                universities = []
        else:
            universities = []

        logger.info(f"Найдено университетов: {len(universities)}")
        logger.info(f"Путь к шаблонам: {TEMPLATES_DIR}")
        logger.info("Формирую ответ...")

        response = templates.TemplateResponse("main.html", {
            "request": request,
            "universities": universities or [],
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


@app.get("/admin", response_class=HTMLResponse)
async def admin_panel(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})


@app.get("/admin_auth", response_class=HTMLResponse)
async def admin_auth_panel(request: Request):
    return templates.TemplateResponse("admin_auth.html", {"request": request})


