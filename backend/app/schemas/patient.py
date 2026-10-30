from pydantic import BaseModel, Field, ConfigDict
from typing import Literal

class PatientCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=30)
    phone: str = Field(min_length=1, max_length=20)
    email: str | None = None
    password: str = Field(min_length=8, max_length=128)
    preferred_language: Literal["en", "ta"] = "en"

class PatientUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=30)
    phone: str | None = Field(default=None, min_length=1, max_length=20)
    email: str | None = None
    preferred_language: Literal["en", "ta"] | None = None
    is_active: bool | None = None

class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    patient_id: int
    full_name: str
    phone: str
    email: str | None
    preferred_language: str
    is_active: bool
