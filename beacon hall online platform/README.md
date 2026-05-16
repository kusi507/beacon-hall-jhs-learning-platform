# EduGhana — JHS Learning Portal MVP

A lightweight, mobile-first quiz platform for Junior High School teachers and students in Ghana (Basic 7–9).

---

## What's in the MVP

| Feature | Teacher | Student |
|---|---|---|
| Account creation (email + password) | ✅ | ✅ |
| Role selection on signup | ✅ | ✅ |
| Create quizzes (up to 10 MCQ, 4 options each) | ✅ | — |
| Assign quiz via class code | ✅ | — |
| View quiz submissions + per-question breakdown | ✅ | — |
| Enter class code to find quizzes | — | ✅ |
| Take quiz (one attempt, 30-min timer) | — | ✅ |
| Instant score + per-question feedback | — | ✅ |
| Review past quiz answers | — | ✅ |
| Simple dashboard (stats + quiz list) | ✅ | ✅ |

---

## Tech Stack (Production Setup)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 + React | File-based routing, SSR, Vercel-native |
| Styling | Tailwind CSS | Utility-first, fast iteration, no design system overhead |
| Auth | Supabase Auth | Email/password, row-level security, free tier |
| Database | Supabase (PostgreSQL) | Structured DB, real-time subs, built-in REST API |
| Hosting | Vercel | One-click Next.js deploy, free for MVPs |

---

## Database Schema (Supabase SQL)

```sql
-- Users are managed by Supabase Auth.
-- Create a profiles table for extra fields:

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text check (role in ('teacher', 'student')) not null,
  school text,
  class text,
  created_at timestamptz default now()
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references profiles(id) on delete cascade,
  title text not null,
  class_code text not null,
  questions jsonb not null,  -- [{id, text, options: [], correct: int}, ...]
  created_at timestamptz default now()
);

create index on quizzes(class_code);
create index on quizzes(teacher_id);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  answers jsonb not null,  -- [0, 2, 1, ...] — index of selected option per question
  score integer not null,  -- 0–100
  submitted_at timestamptz default now(),
  unique(quiz_id, student_id)  -- one attempt per student per quiz
);
```

---

## Project Structure (Next.js)

```
eduGhana/
├── app/
│   ├── layout.tsx          # Root layout, font loading
│   ├── page.tsx            # Landing / redirect to login
│   ├── login/page.tsx      # Login screen
│   ├── register/page.tsx   # Registration screen
│   ├── dashboard/page.tsx  # Teacher or student dashboard (role-aware)
│   ├── quiz/
│   │   ├── create/page.tsx       # Teacher quiz creation wizard
│   │   ├── [id]/take/page.tsx    # Student quiz taking
│   │   ├── [id]/results/page.tsx # Teacher view of submissions
│   │   └── [id]/review/page.tsx  # Student answer review
├── components/
│   ├── ui/Button.tsx
│   ├── ui/Card.tsx
│   ├── ui/Input.tsx
│   ├── TopBar.tsx
│   ├── GhanaFlag.tsx
│   └── Badge.tsx
├── lib/
│   ├── supabase.ts         # Supabase client init
│   ├── auth.ts             # Auth helpers
│   └── db.ts               # DB query helpers
├── middleware.ts            # Route protection (redirect unauthenticated)
├── public/
│   └── favicon.ico
├── .env.local              # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
└── README.md
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- A free account at [supabase.com](https://supabase.com)
- A free account at [vercel.com](https://vercel.com)

### 2. Supabase Setup

1. Create a new project at supabase.com
2. Go to **SQL Editor** and run the schema above
3. Go to **Authentication → Settings**:
   - Enable Email/Password sign-in
   - Disable "Confirm email" for MVP (enable later)
4. Copy your **Project URL** and **anon key** from **Settings → API**

### 3. Local Development

```bash
# Clone / create the project
npx create-next-app@latest eduGhana --typescript --tailwind --app
cd eduGhana

# Install Supabase client
npm install @supabase/supabase-js @supabase/ssr

# Create .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=your_url_here" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here" >> .env.local

# Run locally
npm run dev
# → Open http://localhost:3000
```

### 4. Seed Data (Demo Accounts)

Run this in Supabase SQL Editor after creating accounts manually through the UI:

```sql
-- After signing up a teacher account via the app, find their auth.users ID and run:
insert into profiles (id, name, role, school, class)
values
  ('TEACHER_UUID_HERE', 'Abena Mensah', 'teacher', 'Accra Academy', 'Basic 7'),
  ('STUDENT_UUID_HERE', 'Kwame Asante', 'student', 'Accra Academy', 'Basic 7');

insert into quizzes (teacher_id, title, class_code, questions) values
(
  'TEACHER_UUID_HERE',
  'Ghana Independence Quiz',
  'CLASS7A',
  '[
    {"id":"q1","text":"In what year did Ghana gain independence?","options":["1957","1960","1963","1950"],"correct":0},
    {"id":"q2","text":"Who was Ghana first president?","options":["Jerry Rawlings","John Mahama","Kwame Nkrumah","John Kufuor"],"correct":2},
    {"id":"q3","text":"What is the capital city of Ghana?","options":["Kumasi","Accra","Tamale","Cape Coast"],"correct":1}
  ]'
);
```

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel

# Set env vars in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Or connect your GitHub repo in Vercel for automatic deploys on every push.

---

## Security Checklist

- [ ] Supabase Row Level Security (RLS) enabled on all tables
- [ ] Teachers can only read/write their own quizzes
- [ ] Students can only read their own submissions
- [ ] `unique(quiz_id, student_id)` prevents multiple attempts at DB level
- [ ] Server-side role check before rendering teacher-only pages (`middleware.ts`)
- [ ] Input validation on all form fields (client + server)
- [ ] Rate limiting on auth endpoints (Supabase handles this)

---

## 1-Week User Test Plan

**Setup (Day 0):** Deploy to Vercel. Create demo teacher + student accounts. Brief 1 teacher via WhatsApp call (10 min).

**Day 1–2 — Teacher Onboarding**
- Teacher creates account (measure: < 5 minutes to first quiz)
- Teacher creates 1 quiz and shares class code with up to 20 students
- Track: Did the teacher complete quiz creation without help?

**Day 3–4 — Student Rollout**
- Students create accounts and enter class code
- Students take the quiz
- Track: % of students who complete sign-up, % who submit quiz

**Day 5 — Teacher Reviews**
- Teacher views submission results
- Collect feedback via short WhatsApp voice message (3 questions):
  1. Was it easy to create and share the quiz?
  2. What was confusing or broken?
  3. Would you use this weekly?

**Day 6 — Patch & Iterate**
- Fix top 1–2 reported issues
- Re-deploy

**Day 7 — Measure**
- Sign-up completion rate (target: 80%)
- Quiz submission rate (target: 70% of enrolled students)
- Teacher satisfaction (would use again: Yes/No)

**Success threshold:** If 1 teacher + 14+ of 20 students complete the flow without hand-holding, the MVP is validated.

---

## Low-Bandwidth Optimizations

- No images in MVP (all text + CSS)
- Fonts loaded from Google Fonts (cached after first load)
- Minimal JS bundle (Next.js code-splitting by route)
- No video, audio, or large assets
- Progressive enhancement: basic HTML forms work even if JS is slow to load

---

## Post-MVP Roadmap (Do NOT build these yet)

1. **Edit/delete quizzes** — needs careful UX to avoid breaking existing submissions
2. **Notifications** — SMS via Hubtel/Arkesel API (Ghana-focused SMS providers)
3. **Analytics dashboard** — class performance over time
4. **Image/diagram support** in questions — needed for science/math
5. **Offline mode** — Progressive Web App (PWA) for areas with intermittent connectivity
6. **Admin panel** — school-level management
7. **Multiple quiz attempts** — configurable by teacher
8. **Open-ended questions** — with teacher manual grading

---

*Built for Ghanaian JHS educators. Estimated dev time to production-ready MVP: 60–80 hours.*
