from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine
import app.models  # noqa: F401 - ensure all models are registered
from app.routes.auth import router as auth_router
from app.routes.patient import router as patient_router
from app.routes.doctor import router as doctor_router
from app.routes.doctor_schedule import router as doctor_schedule_router
from app.routes.appointment import router as appointment_router
from app.routes.notification import router as notification_router
from app.routes.voice_call import router as voice_call_router

app = FastAPI(title="Hospital Doctor Booking System")

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(doctor_router)
app.include_router(doctor_schedule_router)
app.include_router(appointment_router)
app.include_router(notification_router)
app.include_router(voice_call_router)

@app.get("/")
def home():
    return {"message": "hello nammathaa"}

@app.get("/dbcheck")
def dbcheck():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {"message": "PostgreSQL connected successfully"}
