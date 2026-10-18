# مكتبي (Maktabi) — law office management (Moroccan practice)
Arabic RTL default, English toggle (localStorage `lang`). Warm theme, IBM Plex Sans Arabic.

## Auth & roles
- Emergent Google OAuth. POST /api/auth/session {session_id} → httpOnly cookie `session_token`. GET /api/auth/me, POST /api/auth/logout.
- users: {user_id, email, name, picture, role admin|member, active, is_test?}. First non-test account → admin. Others must be pre-added via /team (admin only) else 403.
- Team: GET /api/team (all members), POST/PATCH/DELETE /api/team (admin).

## Data / endpoints (all under /api, all require auth)
- clients CRUD (/clients, ?q=), /clients/{id}/cases
- cases CRUD (/cases ?q=&status=), status ongoing|postponed|judged|archived; events log /cases/{id}/events; attachments /cases/{id}/attachments (multipart, pdf/img/doc/docx/txt ≤20MB, stored backend/uploads), GET/DELETE /attachments/{id}
- appointments CRUD (/appointments ?start=&end= YYYY-MM-DD), kind hearing|meeting|other, linked client_id/case_id
- documents CRUD (/documents ?case_id=), /templates (4 Moroccan templates), POST /documents/draft (SSE AI draft)
- library CRUD (/library ?q=&section=&domain=), sections texts|jurisprudence|studies, /library/{id}/attachments
- conversations (per-user) CRUD, POST /conversations/{id}/messages (SSE: data:{delta}|{done}|{error}); context = library_item_id / case_id
- /dashboard: today (APP_TZ=Africa/Casablanca), stats, today/week appointments, active cases, activity
- AI: Claude Sonnet 5.5 (anthropic/claude-sonnet-5-5) via EMERGENT_LLM_KEY, streaming.

## Seed (python seed.py)
- 4 demo library items (texts civil + family, jurisprudence commercial, studies labor).
- Test admin + session (see test_credentials.md).
