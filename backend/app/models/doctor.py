from sqlalchemy import (
    Column, BigInteger, String, Text, Boolean,
    Numeric, DateTime, Identity, CheckConstraint,
    func, text
)
from sqlalchemy.orm import relationship
from app.database import Base


class Doctor(Base):
    __tablename__ = "doctors"
    __table_args__ = (
        CheckConstraint(
            "consultation_fee >= 0",
            name="doctors_consultation_fee_check"
        ),
    )

    doctor_id = Column(BigInteger, Identity(always=True), primary_key=True)
    full_name = Column(String(120), nullable=False)
    specialization = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False, unique=True)
    email = Column(String(150), nullable=True, unique=True)
    password_hash = Column(Text, nullable=False)
    consultation_fee = Column(
        Numeric(10, 2), nullable=False, server_default=text("0")
    )
    is_active = Column(
        Boolean, nullable=False, server_default=text("TRUE")
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Relationships
    schedules = relationship("DoctorSchedule", back_populates="doctor", passive_deletes=True)
    appointments = relationship("Appointment", back_populates="doctor", passive_deletes=True)
