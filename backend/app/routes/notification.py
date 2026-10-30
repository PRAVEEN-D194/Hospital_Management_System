from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.admin import Admin
from app.models.notification import Notification
from app.schemas.notification import (
    NotificationCreate, NotificationStatusUpdate, NotificationResponse
)
from app.core.dependencies import get_current_user, get_current_patient, get_current_admin

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=list[NotificationResponse], status_code=status.HTTP_200_OK)
def get_all_notifications(
    patient_id: int | None = None,
    delivery_status: str | None = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(Notification)
    if patient_id:
        query = query.filter(Notification.patient_id == patient_id)
    if delivery_status:
        query = query.filter(Notification.delivery_status == delivery_status)
    return query.order_by(Notification.created_at.desc()).all()


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    patient = db.get(Patient, notification_data.patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    new_notification = Notification(
        patient_id=notification_data.patient_id,
        appointment_id=notification_data.appointment_id,
        notification_type=notification_data.notification_type,
        message=notification_data.message,
        delivery_channel=notification_data.delivery_channel,
        delivery_status=notification_data.delivery_status
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification


@router.get("/my", response_model=list[NotificationResponse], status_code=status.HTTP_200_OK)
def get_my_notifications(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    return db.query(Notification).filter(
        Notification.patient_id == current_patient.patient_id
    ).order_by(Notification.created_at.desc()).all()


@router.get("/patient/{patient_id}", response_model=list[NotificationResponse], status_code=status.HTTP_200_OK)
def get_patient_notifications(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: Patient | Doctor | Admin = Depends(get_current_user)
):
    if isinstance(current_user, Patient) and current_user.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view another patient's notifications"
        )
    if isinstance(current_user, Doctor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Doctors cannot view patient notifications"
        )

    return db.query(Notification).filter(
        Notification.patient_id == patient_id
    ).order_by(Notification.created_at.desc()).all()


@router.patch("/{notification_id}/status", response_model=NotificationResponse, status_code=status.HTTP_200_OK)
def update_notification_status(
    notification_id: int,
    status_data: NotificationStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    notification = db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.delivery_status = status_data.delivery_status
    if status_data.delivery_status == "sent":
        notification.sent_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(notification)
    return notification

