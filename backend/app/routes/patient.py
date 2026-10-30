from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.admin import Admin
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.core.security import hash_password
from app.core.dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    new_patient = Patient(
        full_name=patient.full_name,
        phone=patient.phone,
        email=patient.email,
        password_hash=hash_password(patient.password),
        preferred_language=patient.preferred_language
    )

    try:
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        return new_patient
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number or email already exists"
        )


@router.get("/", response_model=list[PatientResponse], status_code=status.HTTP_200_OK)
def get_patients(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    return db.query(Patient).order_by(Patient.patient_id).all()


@router.get("/{patient_id}", response_model=PatientResponse, status_code=status.HTTP_200_OK)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: Patient | Doctor | Admin = Depends(get_current_user)
):
    if isinstance(current_user, Patient) and current_user.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot access another patient's private data"
        )
    if isinstance(current_user, Doctor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Doctor cannot view patient private profile"
        )

    patient = db.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return patient


@router.put("/{patient_id}", response_model=PatientResponse, status_code=status.HTTP_200_OK)
def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: Patient | Doctor | Admin = Depends(get_current_user)
):
    if isinstance(current_user, Patient) and current_user.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot modify another patient's data"
        )
    if isinstance(current_user, Doctor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Doctor cannot modify patient data"
        )

    patient = db.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    update_dict = patient_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(patient, field, value)

    try:
        db.commit()
        db.refresh(patient)
        return patient
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number or email already exists"
        )


@router.patch("/{patient_id}/deactivate", response_model=PatientResponse, status_code=status.HTTP_200_OK)
def deactivate_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    patient = db.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    patient.is_active = False
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    patient = db.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    has_appointments = db.query(Appointment).filter(Appointment.patient_id == patient_id).first()
    if has_appointments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete patient with existing appointment history. Please deactivate the patient instead."
        )

    db.delete(patient)
    db.commit()
    return None
