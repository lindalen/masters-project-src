from pydantic import BaseModel, EmailStr, constr

class SignInPayload(BaseModel):
    email: EmailStr
    password: str