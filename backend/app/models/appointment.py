from sqlalchemy import (
    Column, BigInteger, Date, Time, Text, String,
    DateTime, Identity, ForeignKey, CheckConstraint,
    Index, func, text
)
from sqlalchemy.orm import relationship
from app.database import Base


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        CheckConstraint(
            "appointment_status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected')",
            name="appointments_status_check"
        ),
        CheckConstraint(
            "booking_source IN ('web', 'voice')",
            name="appointments_booking_source_check"
        ),
        CheckConstraint(
            "start_time < end_time",
            name="appointments_time_check"
        ),
        # Prevent double booking for the same doctor, date, and start time unless cancelled or rejected
        Index(
            "uq_doctor_active_appointment",
            "doctor_id",
            "appointment_date",
            "start_time",
            unique=True,
            postgresql_where=text("appointment_status NOT IN ('cancelled', 'rejected')")
        ),
        Index("ix_appointments_doctor_date", "doctor_id", "appointment_date"),
        Index("ix_appointments_patient_date", "patient_id", "appointment_date"),
    )

    appointment_id = Column(BigInteger, Identity(always=True), primary_key=True)
    patient_id = Column(
        BigInteger,
        ForeignKey("patients.patient_id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    doctor_id = Column(
        BigInteger,
        ForeignKey("doctors.doctor_id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    appointment_date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    reason_for_visit = Column(Text, nullable=True)
    appointment_status = Column(
        String(20), nullable=False, server_default=text("'pending'")
    )
    booking_source = Column(
        String(10), nullable=False, server_default=text("'web'")
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    notifications = relationship("Notification", back_populates="appointment")
    voice_call_logs = relationship("VoiceCallLog", back_populates="appointment")

