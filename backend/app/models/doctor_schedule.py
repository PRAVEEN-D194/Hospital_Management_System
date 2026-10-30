from sqlalchemy import (
    Column, BigInteger, SmallInteger, Time, Integer, Boolean,
    DateTime, Identity, ForeignKey, CheckConstraint,
    UniqueConstraint, func, text
)
from sqlalchemy.orm import relationship
from app.database import Base


class DoctorSchedule(Base):
    __tablename__ = "doctor_schedules"
    __table_args__ = (
        # day_of_week: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
        CheckConstraint(
            "day_of_week >= 0 AND day_of_week <= 6",
            name="doctor_schedules_day_of_week_check"
        ),
        CheckConstraint(
            "start_time < end_time",
            name="doctor_schedules_time_check"
        ),
        CheckConstraint(
            "slot_duration_minutes > 0",
            name="doctor_schedules_slot_duration_check"
        ),
        UniqueConstraint(
            "doctor_id", "day_of_week", "start_time",
            name="uq_doctor_schedule_day_start"
        ),
    )

    schedule_id = Column(BigInteger, Identity(always=True), primary_key=True)
    doctor_id = Column(
        BigInteger,
        ForeignKey("doctors.doctor_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    day_of_week = Column(SmallInteger, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    slot_duration_minutes = Column(
        Integer, nullable=False, server_default=text("30")
    )
    is_available = Column(
        Boolean, nullable=False, server_default=text("TRUE")
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Relationships
    doctor = relationship("Doctor", back_populates="schedules")

