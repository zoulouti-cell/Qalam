"""Claude Sonnet 5.5 via the Emergent universal key, streamed as SSE."""
import json
import os
import uuid
from typing import AsyncIterator, Awaitable, Callable, Optional

from emergentintegrations.llm.chat import LlmChat, StreamDone, TextDelta, UserMessage
from fastapi.responses import StreamingResponse

PROVIDER, MODEL = "anthropic", "claude-sonnet-5-5"

LEGAL_SYSTEM = (
    "أنت مساعد قانوني ذكي يعمل داخل مكتب محاماة مغربي. تجيب بالعربية الفصحى الواضحة "
    "(أو بلغة السؤال إن كان بغير العربية)، وتعتمد على التشريع المغربي (قانون الالتزامات والعقود، "
    "مدونة الأسرة، مدونة التجارة، مدونة الشغل، القانون الجنائي، قانون المسطرة المدنية...) والاجتهاد القضائي "
    "لمحكمة النقض متى أمكن. تذكر المراجع والفصول عندما تكون متأكداً منها، وتنبه عند عدم اليقين. "
    "تستخدم مصطلحات الممارسة المغربية (الزبناء، المقال الافتتاحي، المذكرة الجوابية، في الشكل، في الموضوع، لهذه الأسباب). "
    "إجاباتك مساعدة ولا تغني عن رأي المحامي."
)


def build_chat(system: str, history: Optional[list[dict]] = None) -> LlmChat:
    initial = [{"role": "system", "content": system}] + (history or [])
    return LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=str(uuid.uuid4()),
        system_message=system,
        initial_messages=initial,
    ).with_model(PROVIDER, MODEL)


def sse_stream(chat: LlmChat, text: str, on_done: Optional[Callable[[str], Awaitable[None]]] = None) -> StreamingResponse:
    async def gen() -> AsyncIterator[str]:
        full = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=text)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield f"data: {json.dumps({'delta': ev.content}, ensure_ascii=False)}\n\n"
                elif isinstance(ev, StreamDone):
                    break
            if on_done:
                await on_done(full)
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as exc:  # surface to client instead of a silent cut
            yield f"data: {json.dumps({'error': str(exc)[:300]})}\n\n"

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
