"""AI model list, dictation (Whisper speech-to-text) and read-aloud (OpenAI text-to-speech)."""
import io
import os

from emergentintegrations.llm.openai import OpenAISpeechToText, OpenAITextToSpeech
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from lib.auth import get_current_user
from lib.llm import MODELS
from models.schemas import AiModel, SpeechIn, Transcript, User

router = APIRouter()
MAX_AUDIO = 25 * 1024 * 1024
TTS_CHUNK = 4000  # API limit is 4096 characters per request
VOICES = {"alloy", "ash", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer"}
PROMPT = "مذكرة قانونية مغربية: المقال الافتتاحي، المذكرة الجوابية، في الشكل، في الموضوع، لهذه الأسباب، محكمة النقض، ق.ل.ع."


@router.get("/ai/models", response_model=list[AiModel])
async def ai_models(_: User = Depends(get_current_user)):
    return [AiModel(id=k, provider=p, label=label) for k, (p, _m, label) in MODELS.items()]


@router.post("/speech/transcribe", response_model=Transcript)
async def transcribe(file: UploadFile = File(...), language: str = Form(""), _: User = Depends(get_current_user)):
    data = await file.read()
    if not data or len(data) > MAX_AUDIO:
        raise HTTPException(status_code=400, detail="audio missing or larger than 25 MB")
    buf = io.BytesIO(data)
    buf.name = file.filename or "dictation.webm"  # the API infers the format from the name
    stt = OpenAISpeechToText(api_key=os.environ["EMERGENT_LLM_KEY"])
    try:
        kw = {"language": language} if language in ("ar", "fr", "en") else {}
        res = await stt.transcribe(file=buf, model="whisper-1", response_format="json", prompt=PROMPT, temperature=0.0, **kw)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"transcription failed: {str(exc)[:120]}")
    return Transcript(text=(res.text or "").strip())


def _chunks(text: str) -> list[str]:
    out, cur = [], ""
    for part in text.replace("\r", "").split("\n"):
        while len(part) > TTS_CHUNK:
            out.append(part[:TTS_CHUNK])
            part = part[TTS_CHUNK:]
        if len(cur) + len(part) + 1 > TTS_CHUNK:
            out.append(cur)
            cur = ""
        cur += part + "\n"
    if cur.strip():
        out.append(cur)
    return [c for c in out if c.strip()]


@router.post("/speech/tts")
async def tts(body: SpeechIn, _: User = Depends(get_current_user)):
    voice = body.voice if body.voice in VOICES else "nova"
    engine = OpenAITextToSpeech(api_key=os.environ["EMERGENT_LLM_KEY"])
    try:
        audio = b"".join([await engine.generate_speech(text=c, model="tts-1", voice=voice, response_format="mp3") for c in _chunks(body.text)])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"speech failed: {str(exc)[:120]}")
    return Response(content=audio, media_type="audio/mpeg")
