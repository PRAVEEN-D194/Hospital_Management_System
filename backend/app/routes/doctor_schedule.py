from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.doctor import Doctor
from app.models.doctor_schedule import DoctorSchedule
from app.models.admin import Admin
from app.schemas.doctor_schedule import (
    DoctorScheduleCreate, DoctorScheduleUpdate, DoctorScheduleResponse
)
from app.core.dependencies import get_current_admin

router = APIRouter(prefix="/doctor-schedules", tags=["Doctor Schedules"])


@router.post("/", response_model=DoctorScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_doctor_schedule(
    schedule_data: DoctorScheduleCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    doctor = db.get(Doctor, schedule_data.doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    if not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add schedule for an inactive doctor"
        )

    # Check for overlapping schedules on the same day for this doctor
    overlap = db.query(DoctorSchedule).filter(
        DoctorSchedule.doctor_id == schedule_data.doctor_id,
        DoctorSchedule.day_of_week == schedule_data.day_of_week,
        DoctorSchedule.start_time < schedule_data.end_time,
        DoctorSchedule.end_time > schedule_data.start_time
    ).first()

    if overlap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Schedule overlaps with an existing schedule for this doctor on this day"
        )

    new_schedule = DoctorSchedule(
        doctor_id=schedule_data.doctor_id,
        day_of_week=schedule_data.day_of_week,
        start_time=schedule_data.start_time,
        end_time=schedule_data.end_time,
        slot_duration_minutes=schedule_data.slot_duration_minutes,
        is_available=schedule_data.is_available
    )

    try:
        db.add(new_schedule)
        db.commit()
        db.refresh(new_schedule)
        return new_schedule
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor schedule conflict detected"
        )


@router.get("/", response_model=list[DoctorScheduleResponse], status_code=status.HTTP_200_OK)
def get_doctor_schedules(
    doctor_id: int | None = Query(default=None, description="Filter by doctor ID"),
    day_of_week: int | None = Query(default=None, ge=0, le=6, description="Filter by day of week (0=Mon..6=Sun)"),
    available_only: bool = Query(default=True, description="Filter for available schedules only"),
    db: Session = Depends(get_db)
):
    query = db.query(DoctorSchedule)
    if doctor_id is not None:
        query = query.filter(DoctorSchedule.doctor_id == doctor_id)
    if day_of_week is not None:
        query = query.filter(DoctorSchedule.day_of_week == day_of_week)
    if available_only:
        query = query.filter(DoctorSchedule.is_available.is_(True))

    return query.order_by(DoctorSchedule.doctor_id, DoctorSchedule.day_of_week, DoctorSchedule.start_time).all()


@router.get("/{schedule_id}", response_model=DoctorScheduleResponse, status_code=status.HTTP_200_OK)
def get_doctor_schedule(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    schedule = db.get(DoctorSchedule, schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor schedule not found"
        )
    return schedule


@router.put("/{schedule_id}", response_model=DoctorScheduleResponse, status_code=status.HTTP_200_OK)
def update_doctor_schedule(
    schedule_id: int,
    schedule_data: DoctorScheduleUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    schedule = db.get(DoctorSchedule, schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor schedule not found"
        )

    target_day = schedule_data.day_of_week if schedule_data.day_of_week is not None else schedule.day_of_week
    target_start = schedule_data.start_time if schedule_data.start_time is not None else schedule.start_time
    target_end = schedule_data.end_time if schedule_data.end_time is not None else schedule.end_time

    if target_start >= target_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_time must be earlier than end_time"
        )

    # Check for overlap with other schedules of the same doctor
    overlap = db.query(DoctorSchedule).filter(
        DoctorSchedule.doctor_id == schedule.doctor_id,
        DoctorSchedule.schedule_id != schedule_id,
        DoctorSchedule.day_of_week == target_day,
        DoctorSchedule.start_time < target_end,
        DoctorSchedule.end_time > target_start
    ).first()

    if overlap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Updated timing overlaps with another schedule for this doctor"
        )

    update_dict = schedule_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(schedule, field, value)

    try:
        db.commit()
        db.refresh(schedule)
        return schedule
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Schedule conflict detected"
        )


@router.patch("/{schedule_id}/deactivate", response_model=DoctorScheduleResponse, status_code=status.HTTP_200_OK)
def deactivate_doctor_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    schedule = db.get(DoctorSchedule, schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor schedule not found"
        )

    schedule.is_available = False
    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    schedule = db.get(DoctorSchedule, schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor schedule not found"
        )

    db.delete(schedule)
    db.commit()
    return None

