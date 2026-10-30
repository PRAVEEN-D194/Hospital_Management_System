from datetime import date, time, datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict, model_validator


class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: date
    start_time: time
    end_time: time
    reason_for_visit: str | None = Field(default=None, max_length=500)
    booking_source: Literal["web", "voice"] = "web"

    @model_validator(mode="after")
    def validate_times(self) -> "AppointmentCreate":
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be earlier than end_time")
        return self


class AppointmentReschedule(BaseModel):
    appointment_date: date
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_times(self) -> "AppointmentReschedule":
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be earlier than end_time")
        return self


class AppointmentStatusUpdate(BaseModel):
    appointment_status: Literal["confirmed", "cancelled", "completed", "rejected"]


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    appointment_id: int
    patient_id: int
    doctor_id: int
    appointment_date: date
    start_time: time
    end_time: time
    reason_for_visit: str | None
    appointment_status: str
    booking_source: str
    created_at: datetime
    updated_at: datetime

