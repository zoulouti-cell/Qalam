// Hand-written mirrors of backend/models/schemas.py — keep in sync.
export type Role = "admin" | "member";
export type CaseStatus = "ongoing" | "postponed" | "judged" | "archived";
export type AppointmentKind = "hearing" | "meeting" | "other";
export type LibrarySection = "texts" | "jurisprudence" | "memos" | "studies";

export interface User {
  user_id: string;
  email: string;
  name: string;
  picture: string;
  role: Role;
  active: boolean;
  created_at: string;
}
export interface TeamInvite { email: string; name: string; role: Role }

export interface ClientIn {
  name: string;
  phone: string;
  email: string;
  address: string;
  id_number: string;
  notes: string;
}
export interface Client extends ClientIn { id: string; created_at: string; case_count: number }

export interface CaseIn {
  file_number: string;
  subject: string;
  court: string;
  opponent: string;
  status: CaseStatus;
  client_id: string;
  assigned_to: string;
  notes: string;
}
export interface Case extends CaseIn { id: string; created_at: string; client_name: string; assigned_name: string }

export interface CaseEventIn { date: string; title: string; details: string }
export interface CaseEvent extends CaseEventIn { id: string; case_id: string; created_by: string; created_at: string }

export interface Attachment {
  id: string;
  owner_type: "case" | "library" | "letterhead" | "office";
  owner_id: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}

export interface AppointmentIn {
  title: string;
  kind: AppointmentKind;
  date: string;
  time: string;
  location: string;
  client_id: string;
  case_id: string;
  notes: string;
}
export interface Appointment extends AppointmentIn { id: string; created_at: string; client_name: string; case_label: string }

export interface DocumentIn { title: string; doc_type: string; content: string; case_id: string; letterhead_id: string }
export interface LegalDocument extends DocumentIn { id: string; created_at: string; updated_at: string; case_label: string }
export interface Template { key: string; title_ar: string; title_en: string; doc_type: string; content: string; custom: boolean }
export interface TemplateIn { title: string; doc_type: string; content: string }
export interface DraftIn { instructions: string; doc_type: string; case_id: string; base_content: string }

export interface LibraryItemIn {
  title: string;
  section: LibrarySection;
  domain: string;
  reference: string;
  date: string;
  content: string;
}
export interface LibraryItem extends LibraryItemIn { id: string; created_at: string; attachments: Attachment[] }

export interface ChatMessage { role: "user" | "assistant"; content: string; created_at: string }
export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  library_item_id: string;
  case_id: string;
  attachment_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}
export interface ConversationIn { title: string; library_item_id: string; case_id: string; attachment_id: string }

export interface Activity { id: string; user_name: string; action: string; label: string; created_at: string }
export interface DashboardStats { clients: number; active_cases: number; today_count: number; documents: number }
export interface Dashboard {
  today: string;
  stats: DashboardStats;
  today_appointments: Appointment[];
  week_appointments: Appointment[];
  active_cases: Case[];
  activity: Activity[];
}

export type LetterheadAlign = "center" | "start";
export type ImageSlot = "header" | "footer" | "page" | "signature" | "stamp";
export interface LetterheadIn {
  name: string;
  office_name: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  footer_text: string;
  align: LetterheadAlign;
  is_default: boolean;
  show_office_logo: boolean;
  signer_name: string;
  margin_top_mm: number;
  margin_bottom_mm: number;
}
export interface Letterhead extends LetterheadIn {
  id: string;
  created_at: string;
  header_image_id: string;
  footer_image_id: string;
  page_image_id: string;
  signature_image_id: string;
  stamp_image_id: string;
}

export interface AgendaItem {
  appointment_id: string;
  time: string;
  title: string;
  location: string;
  case_id: string;
  file_number: string;
  subject: string;
  client_name: string;
  opponent: string;
  last_event: string;
}
export interface AgendaGroup { court: string; items: AgendaItem[] }
export interface Agenda { date: string; total: number; groups: AgendaGroup[] }

export interface OfficeIn { name: string }
export interface Office extends OfficeIn { logo_image_id: string }

export interface DriveStatus { configured: boolean; connected: boolean; email: string; folder_url: string; synced: number; pending: number; last_error: string }
export interface RestoreResult { collections: Record<string, number>; files: number }
