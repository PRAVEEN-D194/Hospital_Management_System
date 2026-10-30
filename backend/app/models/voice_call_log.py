from sqlalchemy import (
    Column, BigInteger, String,
    DateTime, Identity, ForeignKey, CheckConstraint,
    func, text
)
from sqlalchemy.orm import relationship
from app.database import Base


class VoiceCallLog(Base):
    __tablename__ = "voice_call_logs"
    __table_args__ = (
        CheckConstraint(
            "call_language IN ('en', 'ta')",
            name="voice_call_logs_language_check"
        ),
        CheckConstraint(
            "ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at",
            name="voice_call_logs_duration_check"
        ),
    )

    call_id = Column(BigInteger, Identity(always=True), primary_key=True)
    patient_id = Column(
        BigInteger,
        ForeignKey("patients.patient_id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    appointment_id = Column(
        BigInteger,
        ForeignKey("appointments.appointment_id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    phone_number = Column(String(20), nullable=False, index=True)
    call_language = Column(
        String(10), nullable=False, server_default=text("'en'")
    )
    call_status = Column(
        String(30), nullable=False, server_default=text("'initiated'")
    )
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Relationships
    patient = relationship("Patient", back_populates="voice_call_logs")
    appointment = relationship("Appointment", back_populates="voice_call_logs")
    transcripts = relationship(
        "VoiceCallTranscript",
        back_populates="call",
        cascade="all, delete-orphan",
        order_by="VoiceCallTranscript.timestamp"
    )

