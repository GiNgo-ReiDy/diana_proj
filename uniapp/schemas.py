from typing import List, Optional
from pydantic import BaseModel

class Program(BaseModel):
    id: int
    name: str
    required_subjects: list[str]

    class Config:
        from_attributes = True


class University(BaseModel):
    id: int
    name: str
    cities: list[str]
    programs: list[Program] = []

    class Config:
        from_attributes = True


