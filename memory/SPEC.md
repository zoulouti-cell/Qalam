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
