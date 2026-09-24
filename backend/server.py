from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Header, Body
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import uuid
import logging
import requests
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
SESSION_DAYS = 7

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ---------------- Models ----------------
class AppData(BaseModel):
    profile: Optional[dict] = None
    history: list = []
    settings: dict = {"sound": True, "voice": False}
    meal: Optional[dict] = None


class MealRequest(BaseModel):
    goal: Optional[str] = "strength"
    diet: Optional[str] = "veg"
    allergies: Optional[str] = ""
    budget: Optional[str] = "medium"
    age: Optional[int] = 20
    equipment: Optional[str] = "none"


# ---------------- Auth helpers ----------------
def _default_data():
    return {"profile": None, "history": [], "settings": {"sound": True, "voice": False}, "meal": None}


async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        return None
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user


# ---------------- Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "BITS in Motion API"}


@api_router.post("/auth/session")
async def auth_session(
    response: Response,
    x_session_id: str = Header(None, alias="X-Session-ID"),
    body: dict = Body(default={}),
):
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if not x_session_id:
        raise HTTPException(status_code=400, detail="Missing session id")
    try:
        r = requests.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": x_session_id}, timeout=15)
        r.raise_for_status()
        payload = r.json()
    except Exception as e:
        logger.error(f"Emergent session exchange failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid session")

    email = payload["email"]
    name = payload.get("name", "")
    picture = payload.get("picture", "")
    session_token = payload["session_token"]

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc),
        })

    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })

    # One-time merge: if this account has no cloud data yet and the client sent guest data, adopt it.
    data_doc = await db.user_data.find_one({"user_id": user_id}, {"_id": 0})
    guest_data = body.get("guest_data") if isinstance(body, dict) else None
    if not data_doc:
        base = _default_data()
        if guest_data and isinstance(guest_data, dict):
            base["profile"] = guest_data.get("profile")
            base["history"] = guest_data.get("history") or []
            base["settings"] = {**base["settings"], **(guest_data.get("settings") or {})}
            base["meal"] = guest_data.get("meal")
        base["user_id"] = user_id
        base["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.user_data.insert_one(base)
        data_doc = {k: v for k, v in base.items() if k not in ("user_id",)}
    data_doc.pop("updated_at", None)

    response.set_cookie(
        key="session_token", value=session_token, httponly=True, secure=True,
        samesite="none", path="/", max_age=SESSION_DAYS * 24 * 3600,
    )
    return {
        "user": {"user_id": user_id, "email": email, "name": name, "picture": picture},
        "data": {k: data_doc.get(k) for k in ("profile", "history", "settings", "meal")},
    }


@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"user_id": user["user_id"], "email": user["email"], "name": user.get("name", ""), "picture": user.get("picture", "")}


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api_router.get("/data")
async def get_data(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    doc = await db.user_data.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not doc:
        return _default_data()
    return {k: doc.get(k) for k in ("profile", "history", "settings", "meal")}


@api_router.put("/data")
async def put_data(request: Request, data: AppData):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = data.model_dump()
    payload["user_id"] = user["user_id"]
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.user_data.update_one({"user_id": user["user_id"]}, {"$set": payload}, upsert=True)
    return {"ok": True}


GOAL_LABELS = {
    "strength": "building muscle / strength",
    "endurance": "endurance and stamina",
    "fatburn": "fat burn and conditioning",
    "mobility": "mobility, posture and joint health",
}


@api_router.post("/meal/generate")
async def meal_generate(req: MealRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI key not configured")
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    goal_desc = GOAL_LABELS.get(req.goal, "general fitness")
    system = (
        "You are a practical sports nutrition coach for university hostel students. "
        "You suggest realistic, budget-friendly, minimal-cooking meals (kettle/microwave/canteen friendly). "
        "You ALWAYS respond with ONLY valid minified JSON, no markdown, no code fences, no commentary."
    )
    prompt = f"""Create a one-day meal plan for a hostel student.
Fitness goal: {goal_desc}. Age: {req.age}. Diet: {req.diet}. Budget: {req.budget}.
Allergies/dislikes to avoid: {req.allergies or 'none'}.
Return JSON with EXACTLY this shape:
{{"title": string, "day_calories": number, "day_protein_g": number,
"meals": [{{"slot": string, "name": string, "items": [string], "calories": number, "protein_g": number, "rationale": string}}],
"tips": [string]}}
Include 4 meals with slots Breakfast, Lunch, Snack, Dinner. Keep items hostel-friendly and cheap. 3-4 short tips."""

    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"meal-{uuid.uuid4().hex[:8]}", system_message=system).with_model("openai", "gpt-5.4")
        raw = await chat.send_message(UserMessage(text=prompt))
        text = raw.strip()
        if text.startswith("```"):
            text = text.strip("`")
            if text.lower().startswith("json"):
                text = text[4:]
            text = text.strip()
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end != -1:
            text = text[start:end + 1]
        plan = json.loads(text)
    except Exception as e:
        logger.error(f"Meal generation failed: {e}")
        raise HTTPException(status_code=502, detail="Could not generate a plan right now. Try again.")
    return plan


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
