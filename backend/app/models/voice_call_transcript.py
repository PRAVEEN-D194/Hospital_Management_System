from sqlalchemy import (
    Column, BigInteger, String, Text,
    DateTime, Identity, ForeignKey, CheckConstraint,
    func, text
)
from sqlalchemy.orm import relationship
from app.database import Base


class VoiceCallTranscript(Base):
    __tablename__ = "voice_call_transcripts"
    __table_args__ = (
        CheckConstraint(
            "speaker IN ('patient', 'ai_agent')",
            name="voice_call_transcripts_speaker_check"
        ),
        CheckConstraint(
            "language IN ('en', 'ta')",
            name="voice_call_transcripts_language_check"
        ),
    )

    transcript_id = Column(BigInteger, Identity(always=True), primary_key=True)
    call_id = Column(
        BigInteger,
        ForeignKey("voice_call_logs.call_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    speaker = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    language = Column(
        String(10), nullable=False, server_default=text("'en'")
    )
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True
    )

    # Relationships
    call = relationship("VoiceCallLog", back_populates="transcripts")

