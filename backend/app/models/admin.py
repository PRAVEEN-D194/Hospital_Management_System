from sqlalchemy import (
    Column, BigInteger, String, Text, Boolean,
    DateTime, Identity, func, text
)
from app.database import Base


class Admin(Base):
    __tablename__ = "admins"

    admin_id = Column(BigInteger, Identity(always=True), primary_key=True)
    full_name = Column(String(100), nullable=False)
    username = Column(String(50), nullable=False, unique=True, index=True)
    email = Column(String(150), nullable=False, unique=True, index=True)
    password_hash = Column(Text, nullable=False)
    is_active = Column(
        Boolean, nullable=False, server_default=text("TRUE")
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

