# C.U.B. Code MVP Review Packet

## Project Summary

C.U.B. Code is a mobile-first family web app that turns real-world tasks, focus blocks, proof/reflection, and parent approval into earned digital freedom.

Core loop:

**Task → Focus → Proof → Approval → Earned Digital Freedom**

The app calculates earned phone time, XP, Focus Tokens, rewards, and progress. Parents still manually control actual device access.

## Current Stage

The basic MVP functionality is complete. The current focus is reviewing the product architecture, usability, layout hierarchy, and mobile-first UI before adding more features.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Prisma + PostgreSQL
- NextAuth (Credentials, JWT)
- Tailwind CSS

## App Directory Tree

```
src/app/
├── layout.tsx
├── page.tsx                          # Marketing / landing
├── globals.css
├── api/auth/[...nextauth]/route.ts
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── parent/
│   ├── layout.tsx                    # Auth gate only (no PIN)
│   └── unlock/page.tsx               # Parent PIN unlock
├── (dashboard)/                      # Parent area
│   ├── layout.tsx                    # Auth + parent PIN + nav
│   └── dashboard/
│       ├── page.tsx                  # Today (parent home)
│       ├── week/page.tsx
│       ├── family-day/page.tsx
│       ├── council-day/page.tsx
│       ├── rewards/page.tsx
│       ├── cubs/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [cubId]/
│       │       ├── edit/page.tsx
│       │       ├── progress/page.tsx
│       │       └── tasks/page.tsx    # Parent proxy for cub task work
│       ├── family/settings/page.tsx
│       └── tasks/
│           ├── page.tsx              # Task board
│           ├── [taskId]/page.tsx
│           ├── [taskId]/edit/page.tsx
│           ├── review/page.tsx
│           ├── review/[taskId]/page.tsx
│           ├── summer/page.tsx
│           └── templates/
│               ├── page.tsx
│               ├── new/page.tsx
│               └── [id]/edit/page.tsx
└── (cub)/                            # Cub supervised view
    ├── layout.tsx
    └── cub/
        ├── page.tsx                  # Cub picker (multi-cub households)
        └── [cubId]/
            ├── layout.tsx            # Cub header + bottom nav
            ├── page.tsx              # Today
            ├── tasks/page.tsx
            └── progress/page.tsx
```

## Parent Flow

Parents have real user accounts. The parent area lives under `/dashboard` and is protected by login plus an optional parent PIN.

1. Sign up / log in → create family → add Cub profile(s) → set age band and household rules
2. Choose or create tasks (board, templates, summer lite)
3. Assign or let Cubs claim tasks
4. Monitor active work and focus timers from **Today**
5. Review submitted work (**Review** queue) — approve, reject, or send back
6. Approved work credits XP, Focus Tokens, phone time, and Weekend Bank via ledgers
7. Manage rewards, caps, and overrides in **Settings** / **Reward Store**
8. Run weekly **Family Day** (Council Day) reflection
9. Manually release or withhold device access (app calculates; parent enforces)

**Parent navigation (primary):** Today · Tasks · Review · Cubs · Settings · More (week, Family Day, rewards, summer, templates)

## Cub Flow

Cubs are parent-managed profiles, not independent auth users. The supervised view lives under `/cub/[cubId]`.

1. Parent hands device to child (or child picks profile at `/cub`)
2. **Today** shows “Your next step” driven by task state (focus, fix, wait, calm)
3. **Tasks** — claim → start focus → submit proof/reflection
4. **Progress** — XP, phone time available today, rank, reward store
5. **Parent area** button returns to PIN gate → `/dashboard`

Cub cannot approve own work, change rules, or access other families.

**Cub navigation:** Today · Tasks · Progress (bottom tab bar on phone/tablet)

## Authentication and Roles

| Concern | Implementation |
|--------|----------------|
| Auth | NextAuth with **Credentials** provider (email/password, bcrypt) |
| Session | JWT; `session.user.id` on token |
| Roles | No `role` field. One `User` owns one `Family` (`ownerId`). Cubs are `Cub` records |
| Parent routes | `/dashboard/*` — logged in + optional parent PIN (`requireParentUnlock`) |
| Cub routes | `/cub/*` — logged in + `requireCubForUser(cubId, userId)` family scope |
| Middleware | Auth-only on `/dashboard`, `/cub`, `/parent`, `/login`, `/signup` |
| Parent ↔ Cub | Cub header links to `/parent/unlock?returnTo=/dashboard` |

## Shared Components

**`src/components/ui/`:** `button`, `card`, `input`, `label`, `form-field`, `empty-state`, `page-header`, `section-header`, `stat-card`, `status-badge`, `action-tile`

**Navigation:** `dashboard-nav`, `mobile-nav`, `cub-nav`, `cub-header`, `task-board-nav` — parent nav items centralized in `src/lib/dashboard-nav-items.ts`

**Task loop:** `task-card`, `task-workflow-forms`, `cub-workflow-task-card`, `task-review-form`, `review-card`, `focus-session-timer`, `proof-config-fields`

**Cub / family:** `cub-card`, `cub-form`, `cub-progress-view`, `family-settings-form`, `parent-pin-*`

**Rewards / reflection:** `reward-store-*`, `council-day-*`, `weekly-progress-dashboard`, `family-day-*`

## Important Scope Rules

Do not recommend adding:

- Automated device control
- GPS / live location
- Messaging or social features
- Public child profiles
- Child email/password accounts
- Organization dashboards
- AI recommendations
- Crypto / zero-knowledge features
- Full native mobile app
- Marketplace features

Source of truth: `docs/MVP_SCOPE.CONTRACT.md`

## Architecture Review (Summary)

### Verdict

**The MVP is structured well enough to keep building.** Route groups, access control, and next-action patterns are sound. Cleanup before new features should focus on mobile nav completeness, proof-type alignment with privacy rules, and consolidating duplicate task UIs — not a layout rewrite.

### 1. MVP scope discipline — Mostly yes (~85%)

Aligned with scope contract: household loop, ledgers, Council Day, summer lite, no GPS/social/device lock.

Drift to watch:

- `PERFORMANCE_VIDEO` / `SLIDESHOW` proof types conflict with “accountability without exposure”
- Parallel task UIs at `/cub/[id]/tasks` and `/dashboard/cubs/[id]/tasks`

### 2. App structure — Clear

`(dashboard)`, `(cub)`, `(auth)`, `parent/` route groups map to product roles. `src/lib/` is domain-organized (`actions/`, `validations/`, task/reward/council helpers).

### 3. Parent workflow — Strong

`getTodayNextAction()` on Today page; Review queue with badge counts; task board → review → rewards → Family Day matches the contract.

### 4. Cub workflow — Strong

`getCubNextAction()` on Cub Today; three-tab nav; plain-language status copy for ages 5–18.

### 5. Navigation — Good; mobile More added

Bottom tab bars with safe-area padding. Parent mobile nav now includes a **More** sheet (week, Family Day, rewards, summer, templates, log out). Cub nav remains mobile-bottom-only (no desktop top nav yet).

### 6. Next actions — Standout feature

Both parent Today and Cub Today center on a single primary CTA derived from task/state priority. Keep investing here.

### 7. Code organization — Solid

Minor consolidation opportunities: shared task workflow component for cub vs parent-proxy pages; `task-status-badge` vs `ui/status-badge` overlap.

### 8. Reusable components — Emerging design system

`ui/` primitives used on newer screens. Older task/review pages mix raw Tailwind — migrate top 3 screens before adding features.

### 9. Privacy / security — Sound for pilot

No child accounts or cross-family discovery. `requireCubForUser` scopes Cub access. Parent PIN gates dashboard.

Flags:

- Audit video/slideshow `proofLink` storage and visibility
- Prompt parent PIN setup when unset (Cub view reachable on shared device)
- Ensure every server action uses `requireFamilyForUser` / `requireCubForUser`

### 10. Fix before more features (priority order)

1. ~~Mobile parent **More** menu~~ (done)
2. Align proof types with privacy contract (hide or remove video/slideshow for MVP)
3. Consolidate task workflow UI (one component for cub + parent-proxy)
4. Prompt parent PIN setup in onboarding / settings
5. Cub iPad nav (top nav at `lg:` like parent)
6. Unify remaining duplicate patterns (`task-card` variants)

## Review Priorities

Please review for:

1. MVP scope discipline
2. Mobile-first usability
3. Parent workflow clarity
4. Cub workflow clarity
5. Navigation hierarchy
6. Data model clarity
7. Security/privacy risks
8. Code organization
9. Missing empty states
10. UI components that should be refactored into reusable pieces

## Main Question

Is this MVP structured well enough to keep building, or should the layout, hierarchy, and component system be cleaned up first?

**Answer:** Keep building. Do the six cleanup items above in parallel with small features — especially proof-type alignment and task UI consolidation — rather than pausing for a redesign.
