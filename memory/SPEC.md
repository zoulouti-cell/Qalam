# قلم (Qalam) — law office management (Moroccan practice)
Arabic RTL default, English toggle (localStorage `lang`). Emerald + gold brand (logos in frontend/public/brand: qalam-ar.png, qalam-latin.png, qalam-mark.png), IBM Plex Sans Arabic.

## Auth & roles
- Emergent Google OAuth. POST /api/auth/session {session_id} → httpOnly cookie `session_token`. GET /api/auth/me, POST /api/auth/logout.
- users: {user_id, email, name, picture, role admin|member, active, is_test?}. First non-test account → admin. Others must be pre-added via /team (admin only) else 403.
- Team: GET /api/team (all members), POST/PATCH/DELETE /api/team (admin).

## Data / endpoints (all under /api, all require auth)
- clients CRUD (/clients, ?q=), /clients/{id}/cases
- cases CRUD (/cases ?q=&status=), status ongoing|postponed|judged|archived; events log /cases/{id}/events; attachments /cases/{id}/attachments (multipart, pdf/img/doc/docx/txt ≤20MB, stored backend/uploads), GET/DELETE /attachments/{id}
- appointments CRUD (/appointments ?start=&end= YYYY-MM-DD), kind hearing|meeting|other, linked client_id/case_id
- documents CRUD (/documents ?case_id=), content = HTML from the rich-text editor (legacy plain text auto-converted client-side), letterhead_id; /templates (4 Moroccan templates), POST /documents/draft (SSE AI draft, plain text → converted to <p>)
- Print (thead/tfoot repeats letterhead per page), PDF (html2pdf.js, letterhead stamped on every page via jsPDF), Word (.doc HTML) — all in frontend/src/lib/letterhead.tsx
- letterheads (/letterheads; writes admin-only): name, office_name, subtitle, address, phone, email, footer_text, align center|start, is_default (first one auto-default, one default at a time), header/footer images via POST/DELETE /letterheads/{id}/image?slot=header|footer. Default letterhead pre-applied to new documents and printed on the agenda.
- /agenda?date= (default server today): hearings (kind=hearing) grouped by case court (else appointment location, else "—"), with file, parties, last log entry. Page /agenda is printable.
- library CRUD (/library ?q=&section=&domain=), sections texts|jurisprudence|studies, /library/{id}/attachments
- conversations (per-user) CRUD, attachment_id = a case file read in full (pdf/docx/txt via pypdf/python-docx, text cached on attachment.text); with case_id all readable case files are also included (40k char budget). CaseDetail "تحليل" button opens /assistant?c=..&ask=file which auto-asks for a summary.
- conversations POST /conversations/{id}/messages (SSE: data:{delta}|{done}|{error}); context = library_item_id / case_id
- /dashboard: today (APP_TZ=Africa/Casablanca), stats, today/week appointments, active cases, activity
- AI: Claude Sonnet 5.5 (anthropic/claude-sonnet-5-5) via EMERGENT_LLM_KEY, streaming.

## Seed (python seed.py)
- 4 demo library items (texts civil + family, jurisprudence commercial, studies labor).
- Test admin + session (see test_credentials.md).

## Iteration 3 (Qalam v3)
- Brand: circular badge `frontend/public/brand/qalam-badge.png` (cream logo, edges fade into green) used in sidebar, login, favicons, PWA icons.
- Languages: ar (RTL, default) / fr / en. `t(ar, en)`; French = `src/lib/fr.json` keyed by the English string (generated with Claude; add new keys when adding UI strings).
- Moroccan context `src/lib/morocco.ts`: court list (datalist in case form), official holidays (fixed + Islamic via Umm al-Qura, approx ±1 day) shown in calendar/agenda/dashboard, Hijri date, +212 phone formatting. TZ Africa/Casablanca (backend APP_TZ).
- Office profile `/api/office` (name, logo upload `/office/logo`) — logo shown at header end (left in AR, right in FR/EN) and optionally in letterheads (show_office_logo).
- Letterheads add: page mode (slot=page accepts PDF → page 1 rendered to PNG via pypdfium2, used as full-page background with margin_top_mm/margin_bottom_mm), signature & stamp images + signer_name (SignatureBlock appended at document end, toggle in editor).
- PDF pipeline: own html2canvas + jsPDF slicing (lib/letterhead.tsx buildPdf) with clean cuts; share PDF via Web Share (Android/Windows).
- Model memos: 5 extra built-ins (lib/templates_extra.py) + office templates `/api/templates` POST/DELETE (custom=true, HTML) via "save as model" in editor.
- Library sections: texts, jurisprudence (القرارات والاجتهادات), memos, studies. Uploaded files are text-extracted/OCR'd (Gemini 3 Flash via universal key for images & scanned PDFs) → `library.file_text` searchable + used by assistant. Case attachments images/scans also OCR'd for the assistant.
- Agenda: `/api/agenda?date=&lawyer=` and `/api/agenda/week?start=&lawyer=` (7 days); page has day/week + lawyer filter, printable.
- Backup: `/api/backup` (admin) ZIP of all collections + uploads; `/api/backup/restore` replaces data (sessions untouched). Settings page `/settings`.
- Offline: service worker `public/sw.js` (app shell), TanStack Query persisted to IndexedDB (idb-keyval), wiped on logout; "save everything on this device" prefetch in Settings.
- PWA: `public/manifest.webmanifest` (standalone, shortcuts) → installable on Android (Chrome) and Windows (Edge/Chrome).
- Google Drive (`lib/drive.py`, `routers/drive.py`): INACTIVE until GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are in backend/.env. Redirect URI = <public URL>/api/drive/callback. Auto-push of case/library attachments and documents (as Google Docs) to "Qalam - قلم" folder, subfolder per case.

## Iteration 4
- Deadlines (آجال الطعن): `/api/deadlines?case_id=&open=`, `POST /api/cases/{id}/deadlines`, `PATCH/DELETE /api/deadlines/{id}`. Due date computed client-side in `src/lib/deadlines.ts` (art. 512 CPC full days: notified + days + 1, pushed past Sat/Sun + Moroccan holidays; editable). Rules: appeal 30, cassation 30, opposition 10, criminal appeal 10, review 30, custom. Case page panel + dashboard "upcoming deadlines".
- Reminders `src/lib/reminders.ts` (mounted in AppLayout): device notifications via service worker — appointments 24h & 1h before, deadlines 3 days before & on the day; opt-in per device in Settings (Notification permission). Works while the app/tab is open or installed (no server push).
- i18n `t(ar, en, vars)` with `{n}` placeholders (translated in fr.json).
