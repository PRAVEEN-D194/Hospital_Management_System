from typing import Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.patient import PatientResponse
from app.schemas.doctor import DoctorResponse


class PatientLogin(BaseModel):
    phone: str = Field(min_length=1, max_length=20)
    password: str = Field(min_length=1)


class DoctorLogin(BaseModel):
    phone: str = Field(min_length=1, max_length=20)
    password: str = Field(min_length=1)


class AdminLogin(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1)


class AdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    admin_id: int
    full_name: str
    username: str
    email: str
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: PatientResponse | DoctorResponse | AdminResponse | dict[str, Any] | None = None
