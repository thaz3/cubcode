# C.U.B. Code Phase B Scope Contract

## Version
1.0 — Refinement Phase

## Relationship to MVP
Phase B follows the household loop proven in the MVP Scope Contract (`/docs/MVP_SCOPE.CONTRACT.md`).

Phase B theme: **Tighten + sharpen + deepen the existing MVP loop.**

Phase B strengthens the core loop. It does not expand the product surface area.

Core loop:

**Task → Focus → Proof → Approval → Earned Digital Freedom**

## Phase B Priorities (in order)

### 1. Privacy + proof alignment
- Remove or hide risky proof types such as `PERFORMANCE_VIDEO` and `SLIDESHOW` from the MVP user-facing flow.
- Default MVP proof types should be text reflection, checklist confirmation, and only optional tightly scoped private upload if already supported.
- No public media, no child exposure, no moderation-heavy proof workflows.

### 2. Task workflow UI consolidation
- Unify duplicated Cub task workflow and parent-proxy task workflow into shared components.
- Do not change product behavior unless required.
- Goal: same task state behavior, fewer duplicated UI paths, easier maintenance.

### 3. Earned Digital Freedom clarity
- Make approval moments clearer and more emotionally satisfying.
- Show exactly what was earned after approval.
- Improve transparency around XP, Focus Tokens, phone time, and Weekend Bank changes.
- No new reward mechanics.

### 4. Parent dashboard friction reduction
- Make review faster.
- Improve empty states.
- Audit and tune Dashboard / next-action logic.
- Parent should immediately know what needs attention **from data already in the app** (submitted tasks, overdue items, active focus sessions).
- This priority improves existing parent surfaces. It is **not** the Guardian Nudges reminder system. See Phase C.

### 5. Cub iPad and mobile polish
- Improve touch-first layouts.
- Improve iPad layout at larger breakpoints.
- No native mobile app.
- No new architecture.

### 6. UI primitive migration
- Refactor high-traffic screens to use existing or improved UI primitives.
- Focus first on Parent Dashboard, Review, and Cub Today.
- Reduce raw Tailwind duplication where practical.

## Phase B Exclusions
Do not add:

- New reward systems
- Streaks
- New gamification layers
- New task categories
- Messaging
- Device integrations
- AI features
- Analytics dashboards
- Multi-parent roles
- GPS
- Public child profiles
- Organization dashboards
- Marketplace features
- Native mobile app
- Crypto / zero-knowledge features
- **Guardian Nudges / parent reminder rules** (deferred to Phase C — see `/docs/PHASE_C_GUARDIAN_NUDGES.md`)
- **Child-facing reminders or notifications**
- **Email or SMS delivery**
- **Automatic consequences, device control, or child punishment flows**

## Explicitly Deferred to Phase C
The following are documented for roadmap alignment but **must not be implemented during Phase B**:

| Capability | Phase C document |
|------------|------------------|
| Guardian Nudges (parent-first reminder rules) | `/docs/PHASE_C_GUARDIAN_NUDGES.md` |

Phase B may improve how parents see current task state on the dashboard. That work must remain factual, in-app, and tied to existing task data — not a new reminder engine, delivery channel, or child notification path.

## Phase B Implementation Rules
- Phase B is refinement, not expansion.
- Do not add new product features without explicit approval.
- Propose a small plan before each Phase B implementation step.
- Keep database schema changes out of Phase B unless absolutely necessary and explicitly approved.
- Preserve family scoping and privacy boundaries.
- Prioritize mobile and iPad usability.
- Keep proof/accountability private and low-risk.
- Avoid duplicating task workflow logic.
- Use UI primitives consistently where practical.

## Exit Criteria (Phase B complete when)
- Risky proof types are hidden or removed from user-facing flows.
- Cub and parent task workflows share components where behavior is identical.
- Approval moments clearly show earned rewards.
- Parent dashboard and review flows are faster and clearer on mobile/iPad.
- High-traffic screens use shared UI primitives.
- No Phase B exclusions were introduced.
