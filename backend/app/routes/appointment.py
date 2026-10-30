from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.admin import Admin
from app.models.doctor_schedule import DoctorSchedule
from app.models.appointment import Appointment
from app.models.notification import Notification
from app.schemas.appointment import (
    AppointmentCreate, AppointmentReschedule,
    AppointmentStatusUpdate, AppointmentResponse
)
from app.core.dependencies import get_current_user, get_current_patient, get_current_admin

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def check_doctor_availability_and_schedule(
    db: Session,
    doctor_id: int,
    appointment_date: date,
    start_time,
    end_time,
    exclude_appointment_id: int | None = None
) -> None:
    # 1. Doctor active check
    doctor = db.get(Doctor, doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    if not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book an appointment with an inactive doctor"
        )

    # 2. Date in past check
    if appointment_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book an appointment in the past"
        )

    # 3. Schedule match check (day of week: 0=Monday..6=Sunday)
    day_of_week = appointment_date.weekday()
    schedule = db.query(DoctorSchedule).filter(
        DoctorSchedule.doctor_id == doctor_id,
        DoctorSchedule.day_of_week == day_of_week,
        DoctorSchedule.is_available.is_(True),
        DoctorSchedule.start_time <= start_time,
        DoctorSchedule.end_time >= end_time
    ).first()

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor does not have an active schedule covering the selected date and time"
        )

    # 4. Overlapping appointment check
    query = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == appointment_date,
        Appointment.appointment_status.notin_(["cancelled", "rejected"]),
        Appointment.start_time < end_time,
        Appointment.end_time > start_time
    )
    if exclude_appointment_id:
        query = query.filter(Appointment.appointment_id != exclude_appointment_id)

    conflict = query.first()
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor already has an active appointment in the selected time slot"
        )


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def book_appointment(
    appointment_data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_patient: Patient = Depends(get_current_patient)
):
    check_doctor_availability_and_schedule(
        db=db,
        doctor_id=appointment_data.doctor_id,
        appointment_date=appointment_data.appointment_date,
        start_time=appointment_data.start_time,
        end_time=appointment_data.end_time
    )

    new_appointment = Appointment(
        patient_id=current_patient.patient_id,
        doctor_id=appointment_data.doctor_id,
        appointment_date=appointment_data.appointment_date,
        start_time=appointment_data.start_time,
        end_time=appointment_data.end_time,
        reason_for_visit=appointment_data.reason_for_visit,
        appointment_status="confirmed",
        booking_source=appointment_data.booking_source
    )

    try:
        db.add(new_appointment)
        db.flush()

        # Create automated notification
        doctor = db.get(Doctor, appointment_data.doctor_id)
        doctor_name = doctor.full_name if doctor else f"Doctor ID {appointment_data.doctor_id}"
        notification = Notification(
            patient_id=current_patient.patient_id,
            appointment_id=new_appointment.appointment_id,
            notification_type="appointment_booked",
            message=f"Your appointment with {doctor_name} has been booked for {appointment_data.appointment_date} at {appointment_data.start_time.strftime('%H:%M')}.",
            delivery_channel="in-app",
            delivery_status="pending"
        )
        db.add(notification)
        db.commit()
        db.refresh(new_appointment)
        return new_appointment
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict detected while booking appointment"
        )


@router.get("/my", response_model=list[AppointmentResponse], status_code=status.HTTP_200_OK)
def get_my_appointments(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    return db.query(Appointment).filter(
        Appointment.patient_id == current_patient.patient_id
    ).order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).all()


@router.get("/patient/{patient_id}", response_model=list[AppointmentResponse], status_code=status.HTTP_200_OK)
def get_patient_appointments(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: Patient | Doctor | Admin = Depends(get_current_user)
):
    if isinstance(current_user, Patient) and current_user.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot access another patient's appointments"
        )
    if isinstance(current_user, Doctor):
        # Doctors can view appointments assigned to them for this patient
        return db.query(Appointment).filter(
            Appointment.patient_id == patient_id,
            Appointment.doctor_id == current_user.doctor_id
        ).order_by(Appointment.appointment_date.desc()).all()

    return db.query(Appointment).filter(
        Appointment.patient_id == patient_id
    ).order_by(Appointment.appointment_date.desc()).all()


@router.get("/doctor/{doctor_id}", response_model=list[AppointmentResponse], status_code=status.HTTP_200_OK)
def get_doctor_appointments(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: Patient | Doctor | Admin = Depends(get_current_user)
):
    if isinstance(current_user, Doctor) and current_user.doctor_id != doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view another doctor's appointments"
        )
    if isinstance(current_user, Patient):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Patients cannot browse full doctor appointment books"
        )

    return db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id
    ).order_by(Appointment.appointment_date.desc(), Appointment.start_time.asc()).all()


@router.get("/", response_model=list[AppointmentResponse], status_code=status.HTTP_200_OK)
def get_all_appointments(
    status_filter: str | None = Query(default=None, alias="status"),
    doctor_id: int | None = None,
    appointment_date: date | None = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(Appointment)
    if status_filter:
        query = query.filter(Appointment.appointment_status == status_filter)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    if appointment_date:
        query = query.filter(Appointment.appointment_date == appointment_date)

    return query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).all()


@router.get("/{appointment_id}", response_model=AppointmentResponse, status_code=status.HTTP_200_OK)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: Patient | Doctor | Admin = Depends(get_current_user)
):
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if isinstance(current_user, Patient) and current_user.patient_id != appointment.patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view another patient's appointment"
        )
    if isinstance(current_user, Doctor) and current_user.doctor_id != appointment.doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You are not the assigned doctor for this appointment"
        )

    return appointment


@router.patch("/{appointment_id}/cancel", response_model=AppointmentResponse, status_code=status.HTTP_200_OK)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: Patient | Doctor | Admin = Depends(get_current_user)
):
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if isinstance(current_user, Patient) and current_user.patient_id != appointment.patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot cancel another patient's appointment"
        )
    if isinstance(current_user, Doctor) and current_user.doctor_id != appointment.doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You are not the assigned doctor for this appointment"
        )

    if appointment.appointment_status in ["cancelled", "completed", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel an appointment with status '{appointment.appointment_status}'"
        )

    appointment.appointment_status = "cancelled"
    appointment.updated_at = datetime.now(timezone.utc)

    # Automated cancellation notification
    notification = Notification(
        patient_id=appointment.patient_id,
        appointment_id=appointment.appointment_id,
        notification_type="appointment_cancelled",
        message=f"Your appointment scheduled for {appointment.appointment_date} has been cancelled.",
        delivery_channel="in-app",
        delivery_status="pending"
    )
    db.add(notification)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.patch("/{appointment_id}/reschedule", response_model=AppointmentResponse, status_code=status.HTTP_200_OK)
def reschedule_appointment(
    appointment_id: int,
    reschedule_data: AppointmentReschedule,
    db: Session = Depends(get_db),
    current_user: Patient | Doctor | Admin = Depends(get_current_user)
):
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if isinstance(current_user, Patient) and current_user.patient_id != appointment.patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot reschedule another patient's appointment"
        )
    if isinstance(current_user, Doctor) and current_user.doctor_id != appointment.doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You are not the assigned doctor for this appointment"
        )

    if appointment.appointment_status in ["cancelled", "completed", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reschedule an appointment with status '{appointment.appointment_status}'"
        )

    # Validate new timing
    check_doctor_availability_and_schedule(
        db=db,
        doctor_id=appointment.doctor_id,
        appointment_date=reschedule_data.appointment_date,
        start_time=reschedule_data.start_time,
        end_time=reschedule_data.end_time,
        exclude_appointment_id=appointment_id
    )

    appointment.appointment_date = reschedule_data.appointment_date
    appointment.start_time = reschedule_data.start_time
    appointment.end_time = reschedule_data.end_time
    appointment.updated_at = datetime.now(timezone.utc)

    # Notification
    notification = Notification(
        patient_id=appointment.patient_id,
        appointment_id=appointment.appointment_id,
        notification_type="appointment_rescheduled",
        message=f"Your appointment has been rescheduled to {reschedule_data.appointment_date} at {reschedule_data.start_time.strftime('%H:%M')}.",
        delivery_channel="in-app",
        delivery_status="pending"
    )
    db.add(notification)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse, status_code=status.HTTP_200_OK)
def update_appointment_status(
    appointment_id: int,
    status_data: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Patient | Doctor | Admin = Depends(get_current_user)
):
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    # Only Admin or assigned Doctor can update arbitrary appointment status
    if isinstance(current_user, Patient):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patients can only cancel appointments via the cancel endpoint"
        )
    if isinstance(current_user, Doctor) and current_user.doctor_id != appointment.doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You are not the assigned doctor for this appointment"
        )

    appointment.appointment_status = status_data.appointment_status
    appointment.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(appointment)
    return appointment

