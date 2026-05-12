# Paula's Farm Family Marketplace

## Project Overview

Paula's Farm Family Marketplace is a small marketplace + content site built with Next.js and Supabase. It includes a product catalog, farm stories, journal posts, recipes, comments/likes, inquiries (orders), and address management.

Architecture (data flow):

- Next.js App Router (frontend + Server Components)
- Supabase (Postgres + Auth) as the shared data layer
- Catalog sync worker (`workers/catalog-sync.ts`) periodically upserts catalog/content data into Supabase using the Service Role key
- Images are served via `app/photos/[name]/route.ts`, which reads from the repo-local `photo/` directory
- Optional: Sentry (client/server error reporting)

This document follows the task6 security review template and adapts it to this repository as a concise security self-checklist.

## 1. Credential & AI Security

- ❌ No hardcoded credentials: a repository search did not find `sk-...`, AWS keys, or obvious `SUPABASE_SERVICE_ROLE_KEY=...` style secrets committed to source.
- ✅ Environment variable isolation: `.env` / `.env.local` / `.env.*.local` are ignored in [.gitignore](file:///c:/Users/jianghua/Documents/trae_projects/task7/.gitignore#L1-L6), and `.env.example` is redacted.
- ✅ Prevent AI from reading sensitive files: [.cursorrules](file:///c:/Users/jianghua/Documents/trae_projects/task7/.cursorrules#L1-L13) explicitly forbids reading/outputting `.env` and any files containing key/secret/token/password, and enforces `process.env` usage.
- ✅ Environment validation: [env.ts](file:///c:/Users/jianghua/Documents/trae_projects/task7/lib/env.ts#L1-L40) uses Zod to validate env shapes, reducing risk from missing/invalid configuration.

## 2. Auth & Permissions

- ✅ Row Level Security (RLS): core tables have `enable row level security` set in [schema.sql](file:///c:/Users/jianghua/Documents/trae_projects/task7/supabase/schema.sql#L134-L145).
- ✅ Isolation policies: user-private data (`user_preferences`, `user_addresses`, `sunday_rsvps`, `comments`, `likes`, etc.) is scoped via `auth.uid() = user_id` (see [schema.sql](file:///c:/Users/jianghua/Documents/trae_projects/task7/supabase/schema.sql#L171-L228)).
- ✅ Service Role separation: the background sync script [catalog-sync.ts](file:///c:/Users/jianghua/Documents/trae_projects/task7/workers/catalog-sync.ts#L8-L16) writes with a Service Role client; the frontend uses only the public (anon) key and relies on RLS for protection.

## 3. Prompt Injection & Rate Limiting

- Risk assessment: the project does not currently integrate LLM/AI inference, so prompt injection is not applicable today.
- Preventive guardrails: project rules require input filtering, least-privilege access, and rate limiting if AI functionality is introduced in the future (see [.cursorrules](file:///c:/Users/jianghua/Documents/trae_projects/task7/.cursorrules#L1-L13)).

## 4. Monitoring & Supply Chain

- ✅ Third-party auditing: the repo includes a GitHub Actions security workflow running `npm audit --audit-level=high` and `gitleaks` secret scanning (see [security.yml](file:///c:/Users/jianghua/Documents/trae_projects/task7/.github/workflows/security.yml#L1-L26)).
- ✅ Post-change verification: after adding/upgrading dependencies, re-run `npm audit` and `npm ci` locally to keep the lockfile consistent and risk visible.
- ✅ Path traversal defense: the image route filters `..`, `/`, and `\\` to prevent reading unintended files via traversal (see [route.ts](file:///c:/Users/jianghua/Documents/trae_projects/task7/app/photos/%5Bname%5D/route.ts#L32-L35)).

## 5. Recommendations (Optional)

- Husky setup: `husky` and `lint-staged` are present in dependencies, but hooks are not initialized; run `npx husky init` and add pre-commit checks as needed.
- Production env behavior: consider failing fast when env validation fails in production instead of continuing with placeholder values.
- Admin policy hardening: `sync_runs` currently uses a sample email-based admin check (see [schema.sql](file:///c:/Users/jianghua/Documents/trae_projects/task7/supabase/schema.sql#L236-L242)); replace with a role/claim-based approach (custom JWT claims or a dedicated admin table).

## Security Review Prompt (Week 7)

```text
You are doing a security audit on my project. Don't make any changes —just report. Don't read any .env files; use .env.example or the code's references to env vars instead. Cover these seven layers in order.

For each, do the check, then list any issues you find.

1. SECRETS AND ENV VARS
- Run: git log --all -p | grep -iE 'sk-[a-z0-9]{20,}|AIza[a-z0-9_-]{20,}|ghp_[a-z0-9]{20,}|secret.{0,3}[:=]'
- Confirm .env, .env.local, .env.* are all in .gitignore.
- Search source files for hardcoded keys, tokens, passwords, connection strings.
- Check package.json, vercel.json, supabase/config.toml, and any deploy configs for committed secrets.

2. AUTH SURFACES AND RLS
- List every API route or server endpoint in the project.
- For each route, identify: does it require auth? Does it check the user's role/permissions? Does middleware actually run on it (matcher coverage)?
- For Supabase tables: is RLS enabled? Do policies actually check auth.uid() or equivalent? Are there tables holding user data with RLS off?
- Identify any route that the frontend "hides" but the API doesn't actually gate.

3. AI INPUTS AND RATE LIMITS
- Find every place user input flows into an LLM call (Anthropic, OpenAI, Gemini, etc.).
- Is the input bounded? Is there input validation before it reaches the model?
- Is there a rate limit per user / per IP / per key?
- Is there a per-call token cap? A daily token budget?
- Is there a prompt injection surface (untrusted scraped content reaching the model with tool access)?

4. DEV / PREVIEW / PROD ENVIRONMENTS
- Are dev/preview/prod env vars separated in Vercel/Supabase/Clerk?
- Any preview deployment pointed at production credentials?
- Are sensitive env vars (DATABASE_URL, API keys) scoped to the right environments?

5. PRE COMMIT (HUSKY) AND CI GATES
- Is there a .husky/ directory? What runs on pre-commit?
- Is there .github/workflows/? Does CI run: lint, types, build, tests, secret scanning, dependency review?
- Is --no-verify referenced anywhere?
- Are lockfiles committed (package-lock.json, pnpm-lock.yaml, yarn.lock)?

6. MONITORING AND ERROR TRACKING
- Is error tracking integrated (Sentry, Axiom, Logflare, Vercel logs)?
- Are LLM calls logged (prompt, model, tool calls, tokens, cost)?
- What gets alerted on, if anything?

7. SUPPLY CHAIN
- Check package.json dependencies. Anything suspicious — typosquats (express-validatr instead of express-validator), low weekly downloads, recently created, single-maintainer?
- Run npm audit (or pnpm audit / yarn audit) and report findings.
- Are there MCP servers configured for the agent? List the tools each MCP server exposes.
- Is there a CLAUDE.md / AGENTS.md deny list for .env, secrets/, etc.?

REPORT FORMAT
For each issue you find, give:
- LAYER (which of the 7)
- LOCATION (file:line if possible, or "config" / "missing")
- SEVERITY (critical / high / medium / low)
- WHAT'S WRONG (one sentence)
- FIX (one sentence with the specific change)

Don't include code snippets longer than 5 lines.
Be honest about what you can't verify without running code (e.g., RLS policies in a hosted DB you can't query, behavior under load).

Close with:
- TOTAL by severity
- THE ONE FIX I'd do first, and why
- ANYTHING THE AGENT SHOULDN'T BE TRUSTED WITH on this project (write access, .env, etc.) — recommend a deny list for the context file.
```
