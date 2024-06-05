import time
import httpx
from jose import jwt, jwk
from sqlalchemy.orm import Session

APPLE_PUBLIC_KEY_URL = "https://appleid.apple.com/auth/keys"


class AppleAuthService:
    def __init__(self, db: Session):
        self.db = db
        self.apple_public_keys = None
        self.apple_key_cache_exp = 60 * 60 * 24
        self.apple_last_key_fetch = 0

    async def fetch_apple_public_keys(self):
        current_time = int(time.time())
        if (
            self.apple_public_keys is None
            or (self.apple_last_key_fetch + self.apple_key_cache_exp) < current_time
        ):
            async with httpx.AsyncClient() as client:
                response = await client.get(APPLE_PUBLIC_KEY_URL)
                keys = response.json()["keys"]
                self.apple_public_keys = {
                    key["kid"]: jwk.construct(key) for key in keys
                }
                self.apple_last_key_fetch = current_time
        return self.apple_public_keys

    async def verify(self, identity_token: str) -> dict:
        await self.fetch_apple_public_keys()
        headers = jwt.get_unverified_headers(identity_token)
        kid = headers["kid"]
        key = self.apple_public_keys[kid]

        try:
            claims = jwt.decode(
                identity_token,
                key.to_pem(),
                algorithms=["RS256"],
                audience="com.lindalen.medibot",  # Ensure this matches your Service ID
                issuer="https://appleid.apple.com",
            )
            return claims
        except jwt.ExpiredSignatureError:
            raise Exception("The token has expired.")
        except jwt.JWTClaimsError as e:
            raise Exception("Token's claims are invalid: " + str(e))
        except Exception as e:
            raise Exception("An unexpected error occurred: " + str(e))

    def register_or_update_user(self, claims: dict):
        from models.User import User

        user = self.db.query(User).filter(User.email == claims["email"]).first()
        if not user:
            user = User(email=claims["email"], full_name=claims.get("full_name", ""))
            self.db.add(user)
            self.db.commit()

        # Ensure there's a link in user_auth_methods for this user and provider
        from models.UserAuthMethod import UserAuthMethod

        auth_method = (
            self.db.query(UserAuthMethod)
            .filter_by(user_id=user.id, provider="apple")
            .first()
        )
        if not auth_method:
            auth_method = UserAuthMethod(
                user_id=user.id, provider="apple", provider_user_id=claims["sub"]
            )
            self.db.add(auth_method)
            self.db.commit()

        return user

    async def authenticate(self, identity_token: str) -> dict:
        claims = await self.verify(identity_token)
        user = self.register_or_update_user(claims)

        user_info = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name if user.full_name is not None else "",
        }

        return user_info
