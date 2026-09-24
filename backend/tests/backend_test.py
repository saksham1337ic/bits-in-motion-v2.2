"""BITS in Motion backend tests: auth, data CRUD, meal AI."""
import os
import time
import uuid
import subprocess
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://camera-coach-6.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


def _mongo_seed():
    """Seed a user + session directly via mongosh."""
    uid = f"test-user-{int(time.time()*1000)}-{uuid.uuid4().hex[:6]}"
    token = f"test_session_{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}"
    email = f"test.user.{int(time.time()*1000)}@example.com"
    js = f"""
    use('test_database');
    db.users.insertOne({{user_id:'{uid}', email:'{email}', name:'Test User', picture:'', created_at:new Date()}});
    db.user_sessions.insertOne({{user_id:'{uid}', session_token:'{token}', expires_at:new Date(Date.now()+7*24*60*60*1000), created_at:new Date()}});
    """
    r = subprocess.run(["mongosh", "--quiet", "--eval", js], capture_output=True, text=True, timeout=15)
    assert r.returncode == 0, f"mongosh failed: {r.stderr}"
    return uid, token, email


@pytest.fixture(scope="module")
def seeded():
    uid, token, email = _mongo_seed()
    yield {"user_id": uid, "token": token, "email": email}
    # cleanup
    subprocess.run(["mongosh", "--quiet", "--eval",
        f"use('test_database'); db.users.deleteOne({{user_id:'{uid}'}}); db.user_sessions.deleteMany({{user_id:'{uid}'}}); db.user_data.deleteMany({{user_id:'{uid}'}});"],
        capture_output=True, text=True)


@pytest.fixture
def auth_headers(seeded):
    return {"Authorization": f"Bearer {seeded['token']}", "Content-Type": "application/json"}


# ---------- Health ----------
def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert "BITS" in r.json().get("message", "")


# ---------- Auth ----------
class TestAuth:
    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_data_without_token(self):
        r = requests.get(f"{API}/data")
        assert r.status_code == 401

    def test_me_with_valid_token(self, auth_headers, seeded):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["user_id"] == seeded["user_id"]
        assert body["email"] == seeded["email"]

    def test_me_invalid_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer nope-invalid-xyz"})
        assert r.status_code == 401

    def test_session_missing_header(self):
        # No X-Session-ID => 400 by design
        r = requests.post(f"{API}/auth/session", json={})
        assert r.status_code == 400

    def test_session_invalid_id_returns_401(self):
        r = requests.post(f"{API}/auth/session", headers={"X-Session-ID": "fake-invalid"}, json={})
        assert r.status_code == 401


# ---------- Data CRUD ----------
class TestData:
    def test_get_default_data(self, auth_headers):
        r = requests.get(f"{API}/data", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        assert set(["profile", "history", "settings", "meal"]).issubset(body.keys())

    def test_put_and_get_data(self, auth_headers):
        payload = {
            "profile": {"age": 21, "goal": "strength", "equipment": "backpack", "lowImpact": True},
            "history": [{"id": "h1", "exercise": "squats", "reps": 10}],
            "settings": {"sound": False, "voice": True},
            "meal": {"title": "Sample"},
        }
        r = requests.put(f"{API}/data", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

        g = requests.get(f"{API}/data", headers=auth_headers).json()
        assert g["profile"]["goal"] == "strength"
        assert g["profile"]["equipment"] == "backpack"
        assert g["profile"]["lowImpact"] is True
        assert len(g["history"]) == 1
        assert g["settings"]["voice"] is True
        assert g["meal"]["title"] == "Sample"

    def test_logout_clears_session(self, seeded):
        # Use cookies for logout since the endpoint reads cookie
        s = requests.Session()
        s.cookies.set("session_token", seeded["token"], domain=BASE_URL.split("//")[1])
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # subsequent /auth/me with same token must now be 401
        r2 = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {seeded['token']}"})
        assert r2.status_code == 401


# ---------- Meal AI ----------
class TestMeal:
    def test_generate_meal(self):
        payload = {"goal": "strength", "diet": "veg", "allergies": "peanuts",
                   "budget": "low", "age": 21, "equipment": "none"}
        r = requests.post(f"{API}/meal/generate", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        for k in ("title", "day_calories", "day_protein_g", "meals", "tips"):
            assert k in body, f"missing key {k}"
        assert isinstance(body["meals"], list) and len(body["meals"]) >= 1
        m0 = body["meals"][0]
        for k in ("slot", "name", "items", "calories", "protein_g", "rationale"):
            assert k in m0, f"missing meal key {k}"
        assert isinstance(m0["items"], list)
        assert isinstance(body["tips"], list) and len(body["tips"]) >= 1
