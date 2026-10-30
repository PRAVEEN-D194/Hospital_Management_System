from sqlalchemy import (
    Column, BigInteger, String, Text, Boolean,
    DateTime, Identity, CheckConstraint, func, text
)
from sqlalchemy.orm import relationship
from app.database import Base


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = (
        CheckConstraint(
            "preferred_language IN ('en', 'ta')",
            name="patients_preferred_language_check"
        ),
    )

    patient_id = Column(BigInteger, Identity(always=True), primary_key=True)
    full_name = Column(String(30), nullable=False)
    phone = Column(String(20), nullable=False, unique=True)
    email = Column(String(150), nullable=True, unique=True)
    password_hash = Column(Text, nullable=True)
    preferred_language = Column(
        String(10), nullable=False, server_default=text("'en'")
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
    appointments = relationship("Appointment", back_populates="patient", passive_deletes=True)
    notifications = relationship("Notification", back_populates="patient", passive_deletes=True)
    voice_call_logs = relationship("VoiceCallLog", back_populates="patient", passive_deletes=True)
