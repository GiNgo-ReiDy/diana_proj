from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import University, Program, City

# Создаем сессию
db = SessionLocal()

try:
    # Создаем университет
    msu = University(name="МГУ", country="Россия")
    db.add(msu)

    # Создаем программу
    biology_program = Program(name="Биология", required_subjects="Химия, Биология", university=msu)
    db.add(biology_program)

    # Создаем город академической мобильности
    paris = City(name="Париж")
    db.add(paris)

    # Связываем программу и город
    biology_program.cities.append(paris)

    # Сохраняем изменения
    db.commit()
except Exception as e:
    db.rollback()
    print(f"Произошла ошибка: {e}")
finally:
    db.close()