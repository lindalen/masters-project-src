import os
import uuid
from openai import OpenAI
from fastapi import HTTPException

class TranscriptionService:
    def __init__(self):
        self.client = OpenAI()

    async def transcribe(self, audio_bytes: bytes) -> str:
        data_dir = "./data"
        os.makedirs(data_dir, exist_ok=True)
        temp_file_path = f"./data/{uuid.uuid4()}.wav"
        try:
            with open(temp_file_path, "wb") as temp_audio:
                temp_audio.write(audio_bytes)

            with open(temp_file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file
                )
            return transcript.text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)


