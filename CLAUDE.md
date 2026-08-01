# Imran Alasr Website — Claude Instructions

## Project identity

- This folder is the canonical production checkout for the Imran Alasr website.
- Production URL: `https://imranalasr.sa`
- GitHub repository: `https://github.com/SAN-WU6/imranalasr-website`
- Production branch: `main`
- Hosting: Vercel, automatically deployed from GitHub `main`.
- Database: Supabase. Never replace, recreate, reset, or migrate it unless the user explicitly requests that operation.

## Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- Supabase/Postgres in production
- Resend integration exists for notification email
- Arabic RTL and English LTR

## Safety rules

1. Work only inside this checkout. Do not switch to or copy changes from older Imran Alasr folders without explicit approval.
2. Before editing, run `git status --short --branch` and preserve any existing user changes.
3. Never display, copy into chat, commit, or modify secrets from `.env`, `.env.local`, Vercel, Supabase, Resend, or any credential store.
4. Never commit generated folders or local data such as `.next/`, `node_modules/`, `data/`, or `.vercel/`.
5. Do not change DNS, domains, GitHub/Vercel connections, Supabase organizations/projects, environment variables, administrator accounts, or database schema without explicit user approval.
6. Do not delete or reset files, history, data, or services without explicit user approval.
7. Do not invent company facts, project facts, certifications, figures, or claims. Preserve Arabic/English parity and RTL/LTR behavior.

## Editing workflow

When the user asks for a change:

1. Inspect the relevant implementation and explain the intended result briefly.
2. Make the smallest scoped change.
3. Run checks appropriate to the change. Before production deployment, run all of:
   - `npm run typecheck`
   - `npx eslint src`
   - `npm test`
   - `npm run build`
4. Review `git diff` and `git status` and report any failure clearly.
5. Do not deploy merely because editing is complete.

## Production deployment workflow

Only deploy when the user explicitly says words equivalent to **"ارفع التعديل للموقع"**, **"انشر التعديل"**, or **"deploy to production"**.

Before deployment:

1. Confirm the checks above pass.
2. Confirm the diff contains only the intended change and no secret or local environment file.
3. Commit with a concise descriptive message.
4. Push the current `main` branch using `git push origin main`.
5. Confirm the push succeeded. Vercel will then deploy automatically from GitHub.
6. Wait for Vercel to finish, verify the production deployment is Ready, and check the affected page on `https://imranalasr.sa` before reporting success.

If GitHub authentication, a Vercel build, or the live check fails, stop and report the exact problem. Never claim the site is updated until the production URL has been verified.

## Content and email notes

- Content editable from the admin dashboard is stored in Supabase as overrides; source edits and dashboard edits are not interchangeable.
- Contact and quote submissions are stored in Supabase even if email delivery is unavailable.
- The destination mailbox may be overridden by Vercel's `MAIL_TO` environment variable. Do not change it without explicit user approval.
