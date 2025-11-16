from sqlalchemy.orm import Session, joinedload
from models import University, Program, City

# #получение всех универов
# def get_universities(db: Session, skip: int = 0, limit: int = 100):
#     return db.query(University).offset(skip).limit(limit).all()

#получение универа по конкретному id
def get_university(db: Session, program: str = None, subjects: str = None, city: str = None):
    try:
        # Если нет фильтров, просто возвращаем все университеты с eager loading
        if not program and not subjects and not city:
            return db.query(University).options(joinedload(University.programs)).all()
        
        # Собираем ID университетов по каждому фильтру
        university_ids = None
        
        if program:
            ids = db.query(Program.university_id).filter(
                Program.name.ilike(f"%{program}%")
            ).distinct().all()
            university_ids = {id[0] for id in ids if id[0]}
        
        if subjects:
            ids = db.query(Program.university_id).filter(
                Program.required_subjects.contains(subjects)
            ).distinct().all()
            ids_set = {id[0] for id in ids if id[0]}
            if university_ids is not None:
                university_ids = university_ids & ids_set
            else:
                university_ids = ids_set
        
        if city:
            ids = db.query(Program.university_id).join(
                Program.cities
            ).filter(City.name.ilike(f"%{city}%")).distinct().all()
            ids_set = {id[0] for id in ids if id[0]}
            if university_ids is not None:
                university_ids = university_ids & ids_set
            else:
                university_ids = ids_set
        
        # Если есть фильтры, но ничего не найдено
        if university_ids is not None and not university_ids:
            return []
        
        # Загружаем университеты с eager loading
        query = db.query(University).options(joinedload(University.programs))
        if university_ids is not None:
            query = query.filter(University.id.in_(list(university_ids)))
        
        return query.all()
    except Exception as e:
        # Логируем ошибку и пробрасываем исключение
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Ошибка в get_university: {e}", exc_info=True)
        raise
