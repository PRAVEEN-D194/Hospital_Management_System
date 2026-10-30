from sqlalchemy import (
    Column, BigInteger, String, Text,
    DateTime, Identity, ForeignKey, CheckConstraint,
    func, text
)
from sqlalchemy.orm import relationship
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        CheckConstraint(
            "lower(delivery_channel) IN ('sms', 'email', 'whatsapp', 'in-app')",
            name="notifications_delivery_channel_check"
        ),
        CheckConstraint(
            "delivery_status IN ('pending', 'sent', 'failed')",
            name="notifications_delivery_status_check"
        ),
    )

    notification_id = Column(BigInteger, Identity(always=True), primary_key=True)
    patient_id = Column(
        BigInteger,
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    appointment_id = Column(
        BigInteger,
        ForeignKey("appointments.appointment_id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    notification_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    delivery_channel = Column(
        String(20), nullable=False, server_default=text("'in-app'")
    )
    delivery_status = Column(
        String(20), nullable=False, server_default=text("'pending'")
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )
    sent_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="notifications")
    appointment = relationship("Appointment", back_populates="notifications")

