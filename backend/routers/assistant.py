from fastapi import APIRouter, Depends, HTTPException

from lib.auth import get_current_user
from lib.db import db
from lib.llm import LEGAL_SYSTEM, build_chat, sse_stream
from models.schemas import ChatMessage, ChatSend, Conversation, ConversationIn, User, now_iso

router = APIRouter()

HISTORY_TURNS = 20


async def owned(id: str, user: User) -> dict:
    d = await db.conversations.find_one({"id": id, "user_id": user.user_id}, {"_id": 0})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    return d


async def context_block(conv: dict) -> str:
    parts = []
    if conv.get("library_item_id"):
        it = await db.library.find_one({"id": conv["library_item_id"]}, {"_id": 0})
        if it:
            parts.append(f"مادة من المكتبة القانونية للمكتب — {it['title']} ({it.get('reference','')}):\n{it.get('content','')[:12000]}")
    if conv.get("case_id"):
        cs = await db.cases.find_one({"id": conv["case_id"]}, {"_id": 0})
        if cs:
            client = await db.clients.find_one({"id": cs.get("client_id", "")}, {"_id": 0}) or {}
            events = await db.case_events.find({"case_id": cs["id"]}, {"_id": 0}).sort("date", 1).to_list(50)
            log = "\n".join(f"- {e['date']}: {e['title']} {e.get('details','')}" for e in events)
            parts.append(
                f"ملف من ملفات المكتب — رقم {cs['file_number']}، الموضوع: {cs['subject']}، المحكمة: {cs.get('court','')}، "
                f"الخصم: {cs.get('opponent','')}، الموكل: {client.get('name','')}، الحالة: {cs.get('status','')}، "
                f"ملاحظات: {cs.get('notes','')}\nسجل الإجراءات:\n{log}"
            )
    return ("\n\nاعتمد في إجاباتك على السياق التالي عند الاقتضاء:\n" + "\n\n".join(parts)) if parts else ""


@router.get("/conversations", response_model=list[Conversation])
async def list_conversations(user: User = Depends(get_current_user)):
    docs = await db.conversations.find({"user_id": user.user_id}, {"_id": 0, "messages": 0}).sort("updated_at", -1).to_list(500)
    return [Conversation(**d) for d in docs]


@router.post("/conversations", response_model=Conversation)
async def create_conversation(body: ConversationIn, user: User = Depends(get_current_user)):
    c = Conversation(**body.model_dump(), user_id=user.user_id)
    await db.conversations.insert_one(c.model_dump())
    return c


@router.get("/conversations/{id}", response_model=Conversation)
async def get_conversation(id: str, user: User = Depends(get_current_user)):
    return Conversation(**await owned(id, user))


@router.patch("/conversations/{id}", response_model=Conversation)
async def update_context(id: str, body: ConversationIn, user: User = Depends(get_current_user)):
    await owned(id, user)
    d = await db.conversations.find_one_and_update(
        {"id": id}, {"$set": {"library_item_id": body.library_item_id, "case_id": body.case_id}}, projection={"_id": 0}, return_document=True
    )
    return Conversation(**d)


@router.delete("/conversations/{id}")
async def delete_conversation(id: str, user: User = Depends(get_current_user)):
    await owned(id, user)
    await db.conversations.delete_one({"id": id})
    return {"ok": True}


@router.post("/conversations/{id}/messages")
async def send_message(id: str, body: ChatSend, user: User = Depends(get_current_user)):
    conv = await owned(id, user)
    history = [{"role": m["role"], "content": m["content"]} for m in conv.get("messages", [])][-HISTORY_TURNS * 2 :]
    chat = build_chat(LEGAL_SYSTEM + await context_block(conv), history)
    user_msg = ChatMessage(role="user", content=body.text)
    title = conv.get("title") or body.text[:60]

    async def on_done(full: str) -> None:
        await db.conversations.update_one(
            {"id": id},
            {
                "$push": {"messages": {"$each": [user_msg.model_dump(), ChatMessage(role="assistant", content=full).model_dump()]}},
                "$set": {"title": title, "updated_at": now_iso()},
            },
        )

    return sse_stream(chat, body.text, on_done)
