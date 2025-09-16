# 📝 AI Development Rules for Job-Seeking Platform

This document defines the rules and best practices for building and maintaining the **Job-Seeking Platform** using **Next.js**, **Neobrutalism UI Components**, and **Vercel Hosting**.  
The AI (and developers) must always follow these guidelines when generating, reviewing, or editing code.

---

## 🔑 Core Principles

1. **Clarity over Complexity**
   - Always prefer readable, maintainable code over clever but unreadable solutions.
   - Avoid over-engineering. Each feature must serve a clear purpose.

2. **Security First**
   - Never expose secrets (API keys, Supabase tokens, etc.) in client-side code.
   - Use **environment variables** via `process.env`.
   - Validate all user input both client-side (UX) and server-side (security).
   - Apply proper access control:
     - Job seekers can apply & manage their applications.
     - Companies can post & manage their job listings.
     - Admin has oversight.
   - Prevent **XSS, CSRF, SQL Injection, File Upload attacks** at all times.
   - Use HTTPS-only cookies for authentication.

3. **UX-Centered Design**
   - Keep user flows intuitive (e.g., applying for a job = ≤3 steps).
   - Prioritize accessibility: semantic HTML, ARIA attributes, proper contrast.
   - Ensure mobile-first responsiveness.
   - Use **Neobrutalism** UI style: bold colors, thick borders, simple shapes, but maintain usability.

---

## 🛠️ Tech Stack Rules

- **Frontend**:
  - Next.js (App Router if possible).
  - TailwindCSS + Neobrutalism-inspired design system.
  - Shadcn/ui or Radix UI primitives for accessibility.

- **Backend / API**:
  - Next.js API Routes or dedicated serverless functions on Vercel.
  - Supabase for data storage.
  - API responses must always return standardized JSON `{ success, data, error }`.

- **Hosting & Deployment**:
  - Hosted on **Vercel**.
  - Use **Preview Deployments** for testing new features.
  - Production only merges via PR with code review.

---

## 🎨 UI/UX Rules

- **Neobrutalism Guidelines**:
  - Use thick outlines (`border-4`) and bright but limited color palette.
  - Typography: bold headlines, readable body text.
  - Buttons = chunky, high-contrast, hover states clear.
  - Minimal gradients, focus on flat and strong visuals.

- **Job Posting Flow (Company)**:
  - Easy "Post Job" button on dashboard.
  - Form must validate in real-time.
  - Preview job post before publishing.

- **Job Application Flow (Seeker)**:
  - Apply with 1 click if profile already filled.
  - Upload CV securely (Cloudinary or Supabase storage).
  - Confirmation + email notification after applying.

---

## 🔒 Security Rules

1. **Authentication & Authorization**
   - Use JWT or Supabase Auth for sessions.
   - Always check user role (`seeker`, `company`, `admin`) before returning sensitive data.

2. **File Uploads (CVs / Logos)**
   - Must be virus-checked and limited in size.
   - Only allow `.pdf`, `.docx`, `.png`, `.jpg`.

3. **Data Protection**
   - Never expose email lists or CVs publicly.
   - Rate limit API endpoints to prevent abuse.
   - Log spicious activities.

4. **Secrets Management**
   - All keys in `.env.local` only.
   - Never commit `.env*` files.

## ✅ Workflow Rules

1. **Branching**:
   - `main` = production
   - `dev` = staging
   - `feature/*` = new features

2. **Commits**:
   - Use Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).

3. **PR Reviews**:
   - Every PR must be reviewed before merging.
   - Check for: security flaws, UI consistency, accessibility.

---

## 🤖 AI-Specific Rules

- AI must always:
  - Respect these rules when generating code.
  - Provide explanations in comments if code is non-trivial.
  - Suggest improvements for UX or security if gaps are found.
  - Default to **secure & accessible** implementations.

---

🚀 Following this `rules.md` ensures the platform stays **secure, consistent, and user-friendly**.
