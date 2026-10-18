"""Pydantic v2 models. Every model here has a hand-written TS twin in frontend/src/lib/types.ts."""
import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, Field


def new_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


Role = Literal["admin", "member"]
CaseStatus = Literal["ongoing", "postponed", "judged", "archived"]
AppointmentKind = Literal["hearing", "meeting", "other"]
LibrarySection = Literal["texts", "jurisprudence", "studies"]


# ---- users / team ----
class User(BaseModel):
    user_id: str
    email: str
    name: str = ""
    picture: str = ""
    role: Role = "member"
    active: bool = False  # True once the member has signed in at least once
    created_at: str = Field(default_factory=now_iso)


class SessionIn(BaseModel):
    session_id: str


class TeamInvite(BaseModel):
    email: str
    name: str = ""
    role: Role = "member"


class TeamRoleUpdate(BaseModel):
    role: Role


# ---- clients ----
class ClientIn(BaseModel):
    name: str = Field(min_length=1)
    phone: str = ""
    email: str = ""
    address: str = ""
    id_number: str = ""
    notes: str = ""


class Client(ClientIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)
    case_count: int = 0


# ---- cases ----
class CaseIn(BaseModel):
    file_number: str = Field(min_length=1)
    subject: str = Field(min_length=1)
    court: str = ""
    opponent: str = ""
    status: CaseStatus = "ongoing"
    client_id: str = ""
    assigned_to: str = ""  # user_id
    notes: str = ""


class Case(CaseIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)
    client_name: str = ""
    assigned_name: str = ""


class CaseEventIn(BaseModel):
    date: str  # YYYY-MM-DD
    title: str = Field(min_length=1)
    details: str = ""


class CaseEvent(CaseEventIn):
    id: str = Field(default_factory=new_id)
    case_id: str
    created_by: str = ""
    created_at: str = Field(default_factory=now_iso)


class Attachment(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_type: Literal["case", "library", "letterhead"]
    owner_id: str
    filename: str
    content_type: str
    size: int
    created_at: str = Field(default_factory=now_iso)


# ---- appointments ----
class AppointmentIn(BaseModel):
    title: str = Field(min_length=1)
    kind: AppointmentKind = "meeting"
    date: str  # YYYY-MM-DD
    time: str = ""  # HH:MM
    location: str = ""
    client_id: str = ""
    case_id: str = ""
    notes: str = ""


class Appointment(AppointmentIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)
    client_name: str = ""
    case_label: str = ""


# ---- documents ----
class DocumentIn(BaseModel):
    title: str = Field(min_length=1)
    doc_type: str = "memo"
    content: str = ""  # HTML (rich text); legacy docs may be plain text
    case_id: str = ""
    letterhead_id: str = ""


class Document(DocumentIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)
    case_label: str = ""


class Template(BaseModel):
    key: str
    title_ar: str
    title_en: str
    doc_type: str
    content: str


class DraftIn(BaseModel):
    instructions: str = Field(min_length=1)
    doc_type: str = "memo"
    case_id: str = ""
    base_content: str = ""


# ---- library ----
class LibraryItemIn(BaseModel):
    title: str = Field(min_length=1)
    section: LibrarySection = "texts"
    domain: str = "civil"
    reference: str = ""
    date: str = ""
    content: str = ""


class LibraryItem(LibraryItemIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)
    attachments: list[Attachment] = []


# ---- assistant ----
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    created_at: str = Field(default_factory=now_iso)


class Conversation(BaseModel):
    id: str = Field(default_factory=new_id)
    title: str = ""
    user_id: str = ""
    library_item_id: str = ""
    case_id: str = ""
    attachment_id: str = ""  # a case file the assistant should read in full
    messages: list[ChatMessage] = []
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class ConversationIn(BaseModel):
    title: str = ""
    library_item_id: str = ""
    case_id: str = ""
    attachment_id: str = ""


class ChatSend(BaseModel):
    text: str = Field(min_length=1)


# ---- dashboard ----
class Activity(BaseModel):
    id: str = Field(default_factory=new_id)
    user_name: str = ""
    action: str  # machine key e.g. "client.create"
    label: str  # human label, the entity name
    created_at: str = Field(default_factory=now_iso)


class DashboardStats(BaseModel):
    clients: int
    active_cases: int
    today_count: int
    documents: int


class Dashboard(BaseModel):
    today: str
    stats: DashboardStats
    today_appointments: list[Appointment]
    week_appointments: list[Appointment]
    active_cases: list[Case]
    activity: list[Activity]


# ---- letterheads (office header/footer applied to printed & PDF documents) ----
LetterheadAlign = Literal["center", "start"]
ImageSlot = Literal["header", "footer"]


class LetterheadIn(BaseModel):
    name: str = Field(min_length=1)
    office_name: str = ""
    subtitle: str = ""
    address: str = ""
    phone: str = ""
    email: str = ""
    footer_text: str = ""
    align: LetterheadAlign = "center"
    is_default: bool = False


class Letterhead(LetterheadIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)
    header_image_id: str = ""
    footer_image_id: str = ""


# ---- hearing agenda ----
class AgendaItem(BaseModel):
    appointment_id: str
    time: str = ""
    title: str
    location: str = ""
    case_id: str = ""
    file_number: str = ""
    subject: str = ""
    client_name: str = ""
    opponent: str = ""
    last_event: str = ""


class AgendaGroup(BaseModel):
    court: str
    items: list[AgendaItem]


class Agenda(BaseModel):
    date: str
    total: int
    groups: list[AgendaGroup]
