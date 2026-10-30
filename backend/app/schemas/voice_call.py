from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict


class VoiceCallCreate(BaseModel):
    phone_number: str = Field(min_length=1, max_length=20)
    call_language: Literal["en", "ta"] = "en"
    call_status: str = "initiated"
    patient_id: int | None = None
    appointment_id: int | None = None
    started_at: datetime | None = None


class VoiceCallUpdate(BaseModel):
    call_status: str | None = None
    patient_id: int | None = None
    appointment_id: int | None = None
    ended_at: datetime | None = None


class VoiceCallTranscriptCreate(BaseModel):
    speaker: Literal["patient", "ai_agent"]
    message: str
    language: Literal["en", "ta"] = "en"


class VoiceCallTranscriptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    transcript_id: int
    call_id: int
    speaker: str
    message: str
    language: str
    timestamp: datetime


class VoiceCallResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    call_id: int
    patient_id: int | None
    appointment_id: int | None
    phone_number: str
    call_language: str
    call_status: str
    started_at: datetime | None
    ended_at: datetime | None
    created_at: datetime

