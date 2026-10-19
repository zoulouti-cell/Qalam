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
LibrarySection = Literal["texts", "jurisprudence", "memos", "studies"]


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
    owner_type: Literal["case", "library", "letterhead", "office"]
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
    content: str  # plain text for built-ins, HTML for office templates
    custom: bool = False  # saved by the office (deletable)


class TemplateIn(BaseModel):
    title: str = Field(min_length=1)
    doc_type: str = "memo"
    content: str = ""


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
ImageSlot = Literal["header", "footer", "page", "signature", "stamp"]


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
    show_office_logo: bool = False
    signer_name: str = ""  # printed under the signature/stamp
    # "page" mode: a ready blank letterhead (PDF/image) used as the full A4 background
    margin_top_mm: int = Field(default=45, ge=0, le=150)
    margin_bottom_mm: int = Field(default=30, ge=0, le=150)


class Letterhead(LetterheadIn):
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)
    header_image_id: str = ""
    footer_image_id: str = ""
    page_image_id: str = ""
    signature_image_id: str = ""
    stamp_image_id: str = ""


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
    client_phone: str = ""
    opponent: str = ""
    last_event: str = ""


class AgendaGroup(BaseModel):
    court: str
    items: list[AgendaItem]


class Agenda(BaseModel):
    date: str
    total: int
    groups: list[AgendaGroup]


# ---- office profile (logo shown in the app header and optionally on letterheads) ----
class OfficeIn(BaseModel):
    name: str = ""
    whatsapp_number: str = ""  # receives automatic WhatsApp reminders (Twilio, when configured)
    email_reminders: bool = True


class Office(OfficeIn):
    logo_image_id: str = ""


# ---- Google Drive sync ----
class DriveStatus(BaseModel):
    configured: bool  # GOOGLE_CLIENT_ID/SECRET present in backend env
    connected: bool
    email: str = ""
    folder_url: str = ""
    synced: int = 0
    pending: int = 0
    last_error: str = ""


class RestoreResult(BaseModel):
    collections: dict[str, int]
    files: int


# ---- appeal / procedural deadlines (آجال الطعن) ----
class DeadlineIn(BaseModel):
    kind: str = "appeal"  # appeal | cassation | opposition | criminal_appeal | custom
    label: str = Field(min_length=1)
    notified_on: str = ""  # YYYY-MM-DD (تاريخ التبليغ)
    days: int = Field(default=30, ge=0, le=365)
    due_date: str = Field(min_length=10, max_length=10)  # computed client-side (weekends + Moroccan holidays)
    notes: str = ""


class Deadline(DeadlineIn):
    id: str = Field(default_factory=new_id)
    case_id: str
    done: bool = False
    created_at: str = Field(default_factory=now_iso)
    case_file_number: str = ""
    case_subject: str = ""


class DeadlinePatch(BaseModel):
    done: bool


class ReminderStatus(BaseModel):
    email_configured: bool
    whatsapp_configured: bool  # TWILIO_* set in backend env
    last_run_at: str = ""
    last_emails: int = 0
    last_whatsapp: int = 0
    last_error: str = ""


class DeadlineSuggestion(BaseModel):
    kind: str = ""  # one of the DEADLINE_RULES keys
    notified_on: str = ""
    judgment_date: str = ""
    court: str = ""
    summary: str = ""
