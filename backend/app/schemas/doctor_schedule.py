from datetime import time, datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator


class DoctorScheduleCreate(BaseModel):
    doctor_id: int
    day_of_week: int = Field(ge=0, le=6, description="0 = Monday, 6 = Sunday")
    start_time: time
    end_time: time
    slot_duration_minutes: int = Field(default=30, gt=0)
    is_available: bool = True

    @model_validator(mode="after")
    def validate_times(self) -> "DoctorScheduleCreate":
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be earlier than end_time")
        return self


class DoctorScheduleUpdate(BaseModel):
    day_of_week: int | None = Field(default=None, ge=0, le=6)
    start_time: time | None = None
    end_time: time | None = None
    slot_duration_minutes: int | None = Field(default=None, gt=0)
    is_available: bool | None = None

    @model_validator(mode="after")
    def validate_times(self) -> "DoctorScheduleUpdate":
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValueError("start_time must be earlier than end_time")
        return self


class DoctorScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    schedule_id: int
    doctor_id: int
    day_of_week: int
    start_time: time
    end_time: time
    slot_duration_minutes: int
    is_available: bool
    created_at: datetime

