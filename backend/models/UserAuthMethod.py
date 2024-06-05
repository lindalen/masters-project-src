from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from services.database import Base

class UserAuthMethod(Base):
    __tablename__ = 'user_auth_methods'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    provider = Column(String(50))
    provider_user_id = Column(String(255), unique=True)
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="auth_methods")
