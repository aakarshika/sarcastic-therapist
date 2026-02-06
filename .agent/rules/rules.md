---
trigger: always_on
---

# Project Rules (Antigravity)

## 🚨 CRITICAL: NO MIGRATIONS POLICY
This project **never** uses database migrations. The database is ephemeral.
- **NEVER** generate `0001_initial.py` or `makemigrations`.
- Models are the single source of truth.
- To reset: if tables are created or changed, the database is recreated from scratch using `reset_db.py`.

## Stack & Defaults
- **Backend**: Django 5.2 (LTS) + DRF. Auth: SimpleJWT.
- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui.
- **Environment**: Python 3.11, Node 24.
- **Ports**: Backend `:8282`, Frontend `:5252`.

## API Contract (Mandatory)
All endpoints must return this unified envelope:
```json
// Success
{ "success": true, "message": "...", "data": {}, "meta": {} }
// Error
{ "success": false, "message": "...", "errors": { "field": ["details"] }, "error_code": "CODE" }
```
- Use `core.responses` helpers locally.
- Use `core.exceptions` for global handling.

## Code Architecture
### Backend
- **Services > Views**: Complex logic goes in `<app>/services.py`. Views are for transport only.
- **Selectors**: Read logic goes in `<app>/selectors.py` (optional but preferred for extensive queries).
- **Transactions**: Use `transaction.atomic()` in services.

### Frontend
- **Feature-First**: `src/features/<feature>/` contains UI, hooks, and API for that feature.
- **Components**: `src/components/` is only for truly shared/generic UI.
- **Styling**: TailwindCSS only. Use `cn()` for conditional classes.

### DB
- **Registry**: Every new table should be registered in `admin.py`

## Assistant Output Rules
- **Minimal Diffs**: Do not refactor unrelated code.
- **File Paths**: Always use absolute paths.
- **Imports**: Keep them sorted and grouped.

## Verification of Implementation
- **No need**: User will verify frontend and backend manually. If any DB architecture changes are done, then user will stop the server manually, run the reset_db.py script and restart the server. 
- No test scripts needed. Ask user to test by giving them example scenarios.

## AI instructions
- Do not overthink for normal asks. 
- Make minimum lines of code changes unless software practices recommend extra functions.
- Abstract implementation details so the top-level function expresses the algorithm as a clear, step-by-step sequence.

## Backend
- API envelope is mandatory. success / message / data / meta or errors / error_code. No freestyle responses.
- Views are dumb. Request in, response out. No business logic in views.
- Services own orchestration. Multi-step logic lives in services.py, wrapped in transaction.atomic().
- Prevent IDOR by default. Every queryset is scoped by current user / tenant / ownership.
- ORM performance discipline. Always think select_related / prefetch_related. N+1 is a failure, not a bug.
- Global error handling only. One exception handler. No leaked traces. Stable ERROR_CODES.
- Auth is default-on. Public endpoints must be explicit, never accidental.

- **Architecture rules that matter**
- api/ = transport only. Serializers, views, urls. Logic lives elsewhere.
- core/ = truly shared. Responses, exceptions, pagination. No domain logic leakage.
- Domain logic is centralized. Models + managers + services. Predictable, boring, correct.

## Frontend. 

- Feature-first structure.Logic stays in features/<feature>. No component junk drawers.
-UX states are required. Loading, empty, error, success. Every screen. No excuses.
-Design system consistency. Spacing scale, typography hierarchy, shadcn-first components.
-Accessibility by default. Real buttons, labels, aria for icons. No clickable div crimes.
-Centralized API handling. Error normalization once. UI never sees raw backend chaos.


Predictability > cleverness
Same patterns, same flow, every time.
If it feels “creative”, it’s probably wrong.