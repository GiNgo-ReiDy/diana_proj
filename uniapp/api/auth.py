from fastapi import APIRouter, Query, HTTPException, status
from urllib.parse import urlparse, parse_qs
import re

router = APIRouter()  # ← именно router, а не функция
@router.get("/password_check")
async def password_check(
    password: str | None = Query(None),
    login: str | None = Query(None),
):
    ADMIN_PASSWORD = "123"  
    LOGIN = "123"
    if not password or not login:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нужны параметры password и login")

    if password == ADMIN_PASSWORD and login == LOGIN:
        return {"status": "success", "message": "Пароль верный"}
    else:
        return {"status": "error", "message": "Неверный пароль"}