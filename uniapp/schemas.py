from typing import List, Optional
from pydantic import BaseModel

class Program(BaseModel):
    id: int
    name: str
    # university_id = Column(Integer, ForeignKey('university.id'))  # Ваш случай!
    mask_required_all: int
    mask_required_any: int

    class Config:
        from_attributes = True


class University(BaseModel):
    id: int
    name: str
    cities: list[str]
    # programs: list[Program] = []

    class Config:
        from_attributes = True


class Subjects(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
