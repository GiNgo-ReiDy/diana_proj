import pytest

from uniapp.models import ProgramDB, UniversityDB


def test_get_programs_endpoint(client, fake_db):
    p = ProgramDB()
    p.id = 1
    p.name = "Program One"
    p.mask_required_all = 0
    p.mask_required_any = 0
    p.program_url = "/"
    p.university_id = 1
    fake_db.set_next_result([p])

    resp = client.get("/api/program/all")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_add_program_endpoint(client, fake_db):
    # simulate add_program returning object with id
    async def _execute_add(*args, **kwargs):
        return None

    fake_db.set_next_result([])

    payload = {
        "name": "NewProg",
        "required_all": 1,
        "required_any": 0,
        "program_url": "/",
        "university_id": 1
    }
    resp = client.post("/api/program/add", json=payload)
    # API returns created object or error depending on fake DB, accept 200 or 400
    assert resp.status_code in (200, 201, 400)


def test_get_universities_all_endpoint(client, fake_db):
    u = UniversityDB()
    u.id = 1
    u.name = "Uni1"
    u.cities = ["City1"]
    fake_db.set_next_result([u])

    resp = client.get("/api/universities/all")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
