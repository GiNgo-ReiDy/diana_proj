from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY

class Base(DeclarativeBase):
    pass

class UniversityDB(Base):
    __tablename__ = "university"
    id = mapped_column(Integer, primary_key=True)
    name = mapped_column(String)
    cities = mapped_column(ARRAY(Text))

    programs = relationship("ProgramDB", back_populates="university")


class ProgramDB(Base):
    __tablename__ = "program"
    id = mapped_column(Integer, primary_key=True)
    name = mapped_column(String)
    university_id = mapped_column(Integer, ForeignKey("university.id"))

    mask_required_all = mapped_column(Integer)
    mask_required_any = mapped_column(Integer)
    program_url = mapped_column(String)
    university = relationship("UniversityDB", back_populates="programs")


class SubjectsDB(Base):
    __tablename__ = "subjects"
    id = mapped_column(Integer, primary_key=True)
    name = mapped_column(String)

