from pydantic import BaseModel, Field, ConfigDict


class DoctorCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    specialization: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=1, max_length=20)
    email: str | None = Field(default=None, max_length=150)
    password: str = Field(min_length=8)
    consultation_fee: float = Field(default=0, ge=0)


class DoctorUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    specialization: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, min_length=1, max_length=20)
    email: str | None = Field(default=None, max_length=150)
    consultation_fee: float | None = Field(default=None, ge=0)
    is_active: bool | None = None


class DoctorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    doctor_id: int
    full_name: str
    specialization: str
    phone: str
    email: str | None
    consultation_fee: float
    is_active: bool
