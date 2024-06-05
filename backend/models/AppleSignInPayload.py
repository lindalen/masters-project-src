from pydantic import BaseModel

class AppleSignInPayload(BaseModel):
    identityToken: str