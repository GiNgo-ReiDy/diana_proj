from sqlalchemy.orm import Session, joinedload
from app.models import University, Program, City
import logging

logger = logging.getLogger(__name__)

def get_universities(db: Session, skip: int = 0, limit: int = 100):
    try:
        return db.query(University).options(joinedload(University.programs)).offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(f"Ошибка в get_universities: {e}", exc_info=True)
        raise

def get_university(db: Session, program: str = None, subjects: str = None, city: str = None):
    try:
        query = db.query(University).options(joinedload(University.programs))

        if not program and not subjects and not city:
            return query.all()

        university_ids = None

        if program:
            ids = db.query(Program.university_id).filter(
                Program.name.ilike(f"%{program}%")
            ).distinct().all()
            program_ids = {i[0] for i in ids if i[0]}
            university_ids = program_ids if university_ids is None else university_ids & program_ids

        if subjects:
            ids = db.query(Program.university_id).filter(
                Program.required_subjects.ilike(f"%{subjects}%")
            ).distinct().all()
            subjects_ids = {i[0] for i in ids if i[0]}
            university_ids = subjects_ids if university_ids is None else university_ids & subjects_ids

        if city:
            # проверка на существование relationship 'cities' в модели Program
            if hasattr(Program, 'cities'):
                ids = db.query(Program.university_id).join(
                    Program.cities
                ).filter(City.name.ilike(f"%{city}%")).distinct().all()
                city_ids = {i[0] for i in ids if i[0]}
                university_ids = city_ids if university_ids is None else university_ids & city_ids

        if university_ids is not None and not university_ids:
            return []

        if university_ids is not None:
            query = query.filter(University.id.in_(list(university_ids)))

        return query.all()

    except Exception as e:
        logger.error(f"Ошибка в get_university: {e}", exc_info=True)
        raise

def add_university(db: Session, name: str, country: str):
    try:
        db_university = University(name=name, country=country)
        db.add(db_university)
        db.commit()
        db.refresh(db_university)
        return db_university
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка в add_university: {e}", exc_info=True)
        raise

def delete_university(db: Session, university_id: int):
    try:
        db_university = db.query(University).filter(University.id == university_id).first()
        if db_university:
            db.delete(db_university)
            db.commit()
            return True
        return False
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка в delete_university: {e}", exc_info=True)
        raise

def update_university(db: Session, university_id: int, name: str = None, country: str = None):
    try:
        db_university = db.query(University).filter(University.id == university_id).first()
        if db_university:
            if name:
                db_university.name = name
            if country:
                db_university.country = country
            db.commit()
            db.refresh(db_university)
            return db_university
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка в update_university: {e}", exc_info=True)
        raise

def get_university_by_id(db: Session, university_id: int):
    try:
        return db.query(University).options(joinedload(University.programs)).filter(University.id == university_id).first()
    except Exception as e:
        logger.error(f"Ошибка в get_university_by_id: {e}", exc_info=True)
        raise
