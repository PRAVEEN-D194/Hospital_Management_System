import os
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.admin import Admin
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from app.core.security import hash_password
from app.core.dependencies import get_current_admin

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.post("/", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(
    doctor_data: DoctorCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    new_doctor = Doctor(
        full_name=doctor_data.full_name,
        specialization=doctor_data.specialization,
        phone=doctor_data.phone,
        email=doctor_data.email,
        password_hash=hash_password(doctor_data.password),
        consultation_fee=doctor_data.consultation_fee
    )

    try:
        db.add(new_doctor)
        db.commit()
        db.refresh(new_doctor)
        return new_doctor
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number or email already exists"
        )


@router.get("/", response_model=list[DoctorResponse], status_code=status.HTTP_200_OK)
def get_doctors(
    active_only: bool = Query(default=True, description="Filter for active doctors only"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Doctor)
        if active_only:
            query = query.filter(Doctor.is_active.is_(True))
        return query.order_by(Doctor.doctor_id).all()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database error while querying doctors list: {str(exc)}"
        )


def get_default_doctor(db: Session) -> Doctor:
    try:
        default_id_str = os.getenv("DEFAULT_DOCTOR_ID")
        if default_id_str and default_id_str.strip().isdigit():
            doc = db.get(Doctor, int(default_id_str.strip()))
            if doc and doc.is_active:
                return doc
        # Fallback to first active doctor
        doc = db.query(Doctor).filter(Doctor.is_active.is_(True)).order_by(Doctor.doctor_id).first()
        if not doc:
            # Fallback to any doctor if none is marked active
            doc = db.query(Doctor).order_by(Doctor.doctor_id).first()
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No doctor found in the system. Please contact the administrator."
            )
        return doc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error while retrieving doctor: {str(exc)}"
        )


@router.get("/default", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
def get_default_doctor_endpoint(db: Session = Depends(get_db)):
    return get_default_doctor(db)


@router.get("/{doctor_id}", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    try:
        doctor = db.get(Doctor, doctor_id)
        if doctor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )
        return doctor
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database error while retrieving doctor: {str(exc)}"
        )


@router.put("/{doctor_id}", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
def update_doctor(
    doctor_id: int,
    doctor_data: DoctorUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    doctor = db.get(Doctor, doctor_id)
    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    update_dict = doctor_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(doctor, field, value)

    try:
        db.commit()
        db.refresh(doctor)
        return doctor
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number or email already exists"
        )


@router.patch("/{doctor_id}/deactivate", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
def deactivate_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    doctor = db.get(Doctor, doctor_id)
    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    doctor.is_active = False
    db.commit()
    db.refresh(doctor)
    return doctor


@router.patch("/{doctor_id}/reactivate", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
def reactivate_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    doctor = db.get(Doctor, doctor_id)
    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    doctor.is_active = True
    db.commit()
    db.refresh(doctor)
    return doctor


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    doctor = db.get(Doctor, doctor_id)
    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    has_appointments = db.query(Appointment).filter(Appointment.doctor_id == doctor_id).first()
    if has_appointments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete doctor with existing appointment history. Please deactivate the doctor instead."
        )

    db.delete(doctor)
    db.commit()
    return None
