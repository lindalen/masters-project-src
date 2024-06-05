from pydantic import BaseModel, EmailStr, constr

class SignUpPayload(BaseModel):
    email: EmailStr
    password: constr(min_length=6) 
