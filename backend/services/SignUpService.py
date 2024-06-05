from passlib.context import CryptContext
from models import UserAuthMethod
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SignUpService:
    def __init__(self, db: Session):
        self.db = db

    def hash_password(self, password: str) -> str:
        """Hash a password for storing."""
        return pwd_context.hash(password)

    def register(self, email: str, password: str, full_name: str = "None"):
        """Create a new user and their authentication method."""
        hashed_password = self.hash_password(password)
        from models.User import User

        new_user = User(email=email, full_name=full_name)
        self.db.add(new_user)
        self.db.flush()

        from models.UserAuthMethod import UserAuthMethod

        auth_method = UserAuthMethod(
            user_id=new_user.id, provider="local", hashed_password=hashed_password
        )
        self.db.add(auth_method)

        self.db.commit()
        self.db.refresh(new_user)
        return new_user


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
