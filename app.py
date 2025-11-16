from fastapi import FastAPI, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from starlette.responses import HTMLResponse

from crud import get_university
from schemas import University
from database import SessionLocal
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def search_universities(request: Request, program: str = None, subjects: str = None, city: str = None, db: Session = Depends(get_db)):
    universities = get_university(db, program=program, subjects=subjects, city=city)
    return templates.TemplateResponse("search.html", {"request": request, "universities": universities})



