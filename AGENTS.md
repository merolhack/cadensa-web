<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Cadensa - LLM Wiki / Knowledge Base

**Welcome to the Cadensa codebase!** This document serves as the central context and knowledge base for any AI/LLM assisting with the project. Please read this entirely before making architectural decisions or writing new code.

## 1. Project Concept
- **Name:** Cadensa (Inspired by "cadence")
- **Tagline:** Encuentra el ritmo de tu voz. (Find the rhythm of your voice).
- **Description:** A daily platform that trains speech rhythm to overcome blocks and communicate with confidence, similar to Duolingo but for stuttering therapy.
- **Clinical Basis:** Based on "rhythm" and "syllable-timed speech", a proven clinical technique to reduce stuttering by teaching users to speak with a constant rhythm.

## 2. Architecture & Tech Stack (Monorepo PoC)
We use a single monorepo for both frontend and backend configurations.

### Front-end
- **Framework:** Next.js (App Router, strictly configured for Static Export via `output: 'export'`).
- **Language:** TypeScript.
- **Styling:** Tailwind CSS (v4) with dark mode as default/primary aesthetic.
- **Rendering:** Strictly Client-Side Rendering (Client Components marked with `'use client'` when state or auth is needed). No Server-Side Rendering (SSR) since we compile to static HTML/JS/CSS.
- **Deployment Target:** Cloudflare Pages.

### Back-end
- **Database / Auth / Storage:** Supabase (Local CLI for development, Cloud for production).
- **Security:** Strict Row Level Security (RLS) enabled in PostgreSQL. The `service_role` key must NEVER be exposed in the frontend. All data access security is delegated to database RLS policies.
- **Database Sync:** We use `supabase gen types typescript` to generate strictly typed interfaces for the database schema.

### CI/CD
- **Workflow:** GitHub Actions.
- **Triggers:** Push to `main` branch.
- **Process:** Lints, type-checks, runs `next build`, and deploys the `out/` directory to Cloudflare Pages.

## 3. Best Practices & Rules
- **Aesthetics:** The UI must be modern, premium, and dynamic. Use rich color palettes (e.g., emerald/cyan gradients on dark backgrounds), smooth transitions, and avoid generic default styles. The application must not look like a cold medical tool nor a standard language learning app.
- **Security:** Always use `sb_publishable_xxx` or the `anon` key for frontend Supabase clients. 
- **TypeScript:** Use strict typing. When touching Supabase queries, always rely on the generated types (`src/types/supabase.ts`).
- **File Structure:** All Next.js source code lives inside `src/`.
