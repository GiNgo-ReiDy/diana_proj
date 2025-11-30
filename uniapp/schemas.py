from typing import List
from pydantic import BaseModel, Field

class SearchUniversitiesRequest(BaseModel):
    subjects: List[str] = Field(default=[])
    cities: List[str] = Field(default=[])


class Program(BaseModel):
    id: int
    name: str
    # university_id = Column(Integer, ForeignKey('university.id'))  # Ваш случай!
    mask_required_all: int
    mask_required_any: int
    program_url : str
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
