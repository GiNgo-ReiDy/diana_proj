from typing import List, Optional
from pydantic import BaseModel

class UniversityBase(BaseModel):
    name: str
    cities: Optional[List[str]] = None

class University(UniversityBase):
    id: int
    programs: List['Program'] = []

    class Config:
        from_attributes = True

class ProgramBase(BaseModel):
    name: str
    required_subjects: List[str] = []

class Program(ProgramBase):
    id: int
    university: University

    class Config:
        from_attributes = True


