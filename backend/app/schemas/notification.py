from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict


class NotificationCreate(BaseModel):
    patient_id: int
    appointment_id: int | None = None
    notification_type: str
    message: str
    delivery_channel: Literal["SMS", "email", "WhatsApp", "in-app"] = "in-app"
    delivery_status: Literal["pending", "sent", "failed"] = "pending"


class NotificationStatusUpdate(BaseModel):
    delivery_status: Literal["pending", "sent", "failed"]


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    notification_id: int
    patient_id: int
    appointment_id: int | None
    notification_type: str
    message: str
    delivery_channel: str
    delivery_status: str
    created_at: datetime
    sent_at: datetime | None

