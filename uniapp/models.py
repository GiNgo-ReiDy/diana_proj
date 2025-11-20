from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY

class Base(DeclarativeBase):
    pass

class University(Base):
    __tablename__ = 'university'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    cities: Mapped[list] = mapped_column(ARRAY(Text))

    programs = relationship("Program", back_populates="university")

class Program(Base):
    __tablename__ = 'program'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    university_id: Mapped[int] = mapped_column(Integer, ForeignKey('university.id'))
    required_subjects: Mapped[list] = mapped_column(ARRAY(Text))

    university = relationship("University", back_populates="programs")

