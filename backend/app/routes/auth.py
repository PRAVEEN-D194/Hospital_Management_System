from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.admin import Admin
from app.schemas.auth import (
    PatientLogin, DoctorLogin, AdminLogin,
    TokenResponse, AdminResponse
)
from app.schemas.patient import PatientResponse
from app.schemas.doctor import DoctorResponse
from app.core.security import verify_password, create_access_token
from app.core.dependencies import (
    get_current_patient, get_current_doctor, get_current_admin
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ==================== PATIENT AUTH ====================

@router.post("/patient/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def patient_login(
    credentials: PatientLogin,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.phone == credentials.phone).first()
    if not patient or not patient.password_hash or not verify_password(credentials.password, patient.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not patient.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient account is deactivated",
        )

    token = create_access_token({"sub": str(patient.patient_id), "role": "patient"})
    return TokenResponse(access_token=token, token_type="bearer", role="patient", user=patient)


@router.get("/patient/me", response_model=PatientResponse, status_code=status.HTTP_200_OK)
def get_patient_profile(
    current_patient: Patient = Depends(get_current_patient)
):
    return current_patient


# ==================== DOCTOR AUTH ====================

@router.post("/doctor/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def doctor_login(
    credentials: DoctorLogin,
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.phone == credentials.phone).first()
    if not doctor or not doctor.password_hash or not verify_password(credentials.password, doctor.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor account is deactivated",
        )

    token = create_access_token({"sub": str(doctor.doctor_id), "role": "doctor"})
    return TokenResponse(access_token=token, token_type="bearer", role="doctor", user=doctor)


@router.get("/doctor/me", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
def get_doctor_profile(
    current_doctor: Doctor = Depends(get_current_doctor)
):
    return current_doctor


# ==================== ADMIN AUTH ====================

@router.post("/admin/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def admin_login(
    credentials: AdminLogin,
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).filter(
        (Admin.username == credentials.username) | (Admin.email == credentials.username)
    ).first()
    if not admin or not admin.password_hash or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is deactivated",
        )

    token = create_access_token({"sub": str(admin.admin_id), "role": "admin"})
    return TokenResponse(access_token=token, token_type="bearer", role="admin", user=admin)


@router.get("/admin/me", response_model=AdminResponse, status_code=status.HTTP_200_OK)
def get_admin_profile(
    current_admin: Admin = Depends(get_current_admin)
):
    return current_admin
