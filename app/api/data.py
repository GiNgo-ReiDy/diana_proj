from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from app.crud import get_university
from app.database import SessionLocal

router = APIRouter()  # ← именно router, а не функция

@router.get("")
def api_search_universities(
    program: str | None = Query(None),
    subjects: str | None = Query(None),
    city: str | None = Query(None)
):
    db: Session = SessionLocal()
    try:
        universities = get_university(db, program=program, subjects=subjects, city=city)
        return [
            {
                "id": u.id,
                "name": u.name,
                "country": u.country,
                "programs": [{"name": p.name, "required_subjects": p.required_subjects} for p in u.programs]
            }
            for u in universities
        ]
    finally:
        db.close()
