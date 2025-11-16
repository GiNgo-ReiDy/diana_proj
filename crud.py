from sqlalchemy.orm import Session
from models import University, Program, City

# #получение всех универов
# def get_universities(db: Session, skip: int = 0, limit: int = 100):
#     return db.query(University).offset(skip).limit(limit).all()

#получение универа по конкретному id
def get_university(db: Session, program: str = None, subjects: str = None, city: str = None):
    query = db.query(University).join(Program).join(City)

    if program:
        query = query.filter(Program.name == program)
    if subjects:
        query = query.filter(Program.required_subjects.contains(subjects))
    if city:
        query = query.filter(City.name == city)

    return query.all()
