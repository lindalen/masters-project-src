from models import (
    AppleSignInPayload,
    SignInPayload,
    SignUpPayload,
    User,
    UserAuthMethod,
    StandardChatMessage,
    ChatRequestPayload,
)
from services import (
    AppleAuthService,
    SignUpService,
    TranscriptionService,
    ObservationService,
    PatientService,
    ConversationService,
)
from services.SignUpService import verify_password
from dependencies import get_db
from fastapi import APIRouter, UploadFile, File, Body, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from dotenv import load_dotenv, find_dotenv
import re

load_dotenv(find_dotenv())
router = APIRouter()

transcription_service = TranscriptionService()


@router.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    transcription = await transcription_service.transcribe(audio_bytes)
    return {"response": transcription}


@router.post("/api/observations")
async def save_observations(
    messages: List[StandardChatMessage],
    user_id: int = Body(...),
    db: Session = Depends(get_db),
):
    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=400, detail={"errors": "User does not exist."}
            )

        if len(messages) == 0:
            raise HTTPException(
                status_code=400, detail={"errors": "Invalid conversation."}
            )

        observation_service = ObservationService()
        observations = await observation_service.extract_observations_from_messages(
            messages
        )

        if observations.patient_information is not None:
            patient_service = PatientService(db)
            await patient_service.upsert_from_observations(user_id, observations)

        await observation_service.save(user_id, observations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went bad. Error {e}")


@router.delete("/api/observations/{user_id}")
async def delete_observations(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=400, detail={"errors": "User does not exist."}
            )

        observation_service = ObservationService()
        await observation_service.delete_all(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went bad. Error {e}")


@router.delete("/api/observations/{user_id}/{row_id}")
async def delete_specific_observation(
    user_id: int, row_id: str, db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist.")

    try:
        observation_service = ObservationService()
        await observation_service.delete(user_id, row_id)
        return {"message": "Observation deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@router.delete("/api/patient_information/{user_id}")
async def clear_patient_information(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User does not exist.")

    try:
        patient_service = PatientService(db)
        await patient_service.delete_all(user_id)
        return {"message": "Patient info deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@router.post("/api/chat")
async def chat_with_model(
    request: ChatRequestPayload,
    db: Session = Depends(get_db),
):
    try:
        model = request.model
        user_id = request.user_id
        messages = request.messages
        memory = request.memory

        conversation_service = ConversationService(
            db=db, user_id=user_id, model=model, memory=memory
        )
        response = await conversation_service.get_response(messages)

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went bad. Error {e}")


@router.get("/api/user-info/{user_id}")
async def get_user_info(user_id: int, db: Session = Depends(get_db)):
    try:
        patient_service = PatientService(db)
        observation_service = ObservationService()

        patient_info = await patient_service.get(user_id)
        patient_info = patient_info.to_dict() if patient_info is not None else {}
        observations = await observation_service.get(user_id)

        return {"observations": observations, "patient_info": patient_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auth/apple")
async def apple_auth(payload: AppleSignInPayload, db: Session = Depends(get_db)):
    service = AppleAuthService(db)

    try:
        apple_user = await service.authenticate(payload.identityToken)
        return apple_user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/auth/signup")
async def signup(payload: SignUpPayload, db: Session = Depends(get_db)):
    errors = {}
    signup_service = SignUpService(db)

    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        errors["email"] = "Email is already in use"

    if not re.match(r"[A-Za-z0-9@#$%^&+=]{8,}", payload.password):
        errors["password"] = "Password does not meet complexity requirements"

    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    user = signup_service.register(email=payload.email, password=payload.password)

    return {"email": user.email, "id": user.id}


@router.post("/auth/signin")
async def signin(payload: SignInPayload, db: Session = Depends(get_db)):
    errors = {}

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        errors["email"] = "Email does not exist"

    if not errors:
        user_auth_method = (
            db.query(UserAuthMethod).filter(UserAuthMethod.user_id == user.id).first()
        )
        if not user_auth_method or not verify_password(
            payload.password, user_auth_method.hashed_password
        ):
            errors["password"] = "Incorrect password"

    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    return {"email": user.email, "id": user.id}
