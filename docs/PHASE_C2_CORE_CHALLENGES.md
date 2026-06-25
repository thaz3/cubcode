# C.U.B. Code Phase C2 — Core Challenge Framework

## Version
0.1 — Roadmap Concept (Not Approved for Implementation)

## Status
**Documentation only.** Do not implement application code until this document is explicitly approved and scheduled after Phase B exit criteria are met.

Phase C2 is a **separate roadmap item** from Phase C1 (Guardian Nudges). Guardian Nudge *delivery stages* (in-app, email, SMS) use internal labels C1–C4 inside `/docs/PHASE_C_GUARDIAN_NUDGES.md`. Those labels are not the same as Phase C1 / Phase C2 product phases.

## Purpose

Core Challenges allow parents to create repeatable, structured agreements for real-world growth.

A **task** is one action.

A **challenge** is a repeatable program:

**Activity → Target → Interval → Proof → Parent Approval → Reward**

Core Challenges must strengthen the C.U.B. Code loop, not replace it.

The loop remains:

**Task / Challenge → Focus → Proof → Approval → Earned Digital Freedom**

## Product Philosophy

Parents remain in control.

C.U.B. Code should make expectations visible and trackable. It should not decide consequences, bypass parent authority, or automatically punish children.

Challenges are parent-created or parent-approved.

## Product Promise Alignment

Core Challenges extend the existing promise:

**C.U.B. Code calculates earned digital freedom. Parents control access.**

Challenges add **structured, repeatable growth agreements**. They do not add device control, automatic consequences, or parent bypass.

## Core Challenge Types

### 1. Tracked Numeric Challenge (`NUMERIC_TRACKED`)

For activities with countable metrics.

**Examples:**

- Practice instrument for 45 minutes every weekday
- Walk 3 miles 3 days a week
- Practice Spanish for 30 minutes every weekday
- Read 20 pages every night

**Fields:**

- Activity
- Target value
- Unit
- Interval
- Proof type
- Reward
- Optional Guardian Nudge rule

**Units may include:**

- minutes
- miles
- steps
- pages
- repetitions
- times

### 2. Parent-Verified Data Challenge (`PARENT_VERIFIED_DATA`)

For data that a parent manually checks or enters.

Do **not** call this true data sync yet.

**Examples:**

- Maintain a 95 average in homework/classwork every week
- Maintain an 85 overall average in core subjects every quarter
- Submit a weekly grade check

**Fields:**

- Activity or subject
- Target value
- Unit/metric
- Interval
- Parent verification input
- Reward
- Optional Guardian Nudge rule

Do **not** implement school portal integrations in C2.

### 3. Chore / Routine Challenge (`BINARY_ROUTINE`)

Simple recurring done/not-done routines.

**Examples:**

- Clean bedroom every Sunday
- Clean dog bowls every day
- Take out trash every Tuesday and Thursday
- Make bed every weekday

**Fields:**

- Activity
- Area or routine name
- Interval
- Completion checkbox
- Proof type
- Reward
- Optional Guardian Nudge rule

## Recommended Data Model Direction

Use a hybrid structure:

- Normal typed fields for common challenge data
- JSON config only for type-specific options

**Possible models:**

| Model | Role |
|-------|------|
| `ChallengeTemplate` | Parent-defined reusable challenge blueprint (family-scoped) |
| `Challenge` | Active challenge instance assigned to a Cub |
| `ChallengeProgressLog` | Per-interval progress, proof, and approval state |

Do not overbuild marketplace templates, public templates, AI challenge creation, or external integrations.

### Suggested fields (conceptual)

**Shared (typed):**

- `familyId`, `cubId`, `createdByUserId`
- `challengeType` (`ChallengeType` enum)
- `title` / activity description
- `intervalType` (`IntervalType` enum)
- `intervalConfig` (JSON — e.g. days per week count, custom cron-like spec)
- `targetValue` (nullable for binary routines)
- `targetUnit` (`TargetUnit` enum)
- `proofType` (reuse or extend existing proof enums)
- Reward fields aligned with existing task reward shape (`xpEarned`, `focusTokensEarned`, `phoneMinutesEarned`, etc.)
- `status` (active, paused, completed, archived)
- `optionalGuardianNudgeRuleId` (nullable FK when Phase C1 nudges exist)

**Type-specific (JSON `typeConfig` only when needed):**

- `NUMERIC_TRACKED`: min/max per log entry, cumulative vs per-session target
- `PARENT_VERIFIED_DATA`: subject label, verification prompt, parent input schema
- `BINARY_ROUTINE`: area/routine name, checklist items

**`ChallengeProgressLog` (per interval window):**

- `challengeId`, `intervalStart`, `intervalEnd`
- `loggedValue` (numeric, nullable)
- `parentVerifiedValue` (nullable)
- `completed` (boolean for binary)
- `proofPayload` (JSON — reflection, checklist, time log reference)
- `status` (pending, submitted, sent back, rejected, approved, rewarded)
- `submittedAt`, `reviewedAt`, `reviewedByUserId`

Prefer deriving “current interval” from `intervalType` + timestamps rather than storing duplicate schedule state.

## Suggested Enums

### ChallengeType

- `NUMERIC_TRACKED`
- `PARENT_VERIFIED_DATA`
- `BINARY_ROUTINE`

### IntervalType

- `DAILY`
- `WEEKDAYS`
- `WEEKLY`
- `DAYS_PER_WEEK`
- `MONTHLY`
- `QUARTERLY`
- `CUSTOM`

### TargetUnit

- `MINUTES`
- `MILES`
- `STEPS`
- `PAGES`
- `TIMES`
- `PERCENT`
- `GRADE_AVERAGE`
- `CHECKBOX`

## Workflow (Concept)

1. Parent creates or selects a challenge template and assigns it to a Cub.
2. Each interval window opens (e.g. “this weekday”, “this week”).
3. Cub logs progress (numeric entry, checkbox, reflection, or time log).
4. For `PARENT_VERIFIED_DATA`, parent enters or confirms the metric.
5. Cub submits the interval for review (or parent initiates verification).
6. Parent approves, rejects, or sends back — same human judgment as tasks.
7. On approval, existing ledgers grant XP, Focus Tokens, phone time, or Weekend Bank credit per challenge reward config.
8. Parent manually enforces device access per Manual Enforcement Rule.

**Rule:** No interval is rewarded until the responsible adult approves it.

## Constraints

Do **not** add:

- School portal sync
- Google Classroom sync
- AI-generated challenges
- Public challenge marketplace
- Child-to-child challenges
- Social leaderboards
- Messaging
- GPS
- Device control
- Automatic punishment
- New reward systems beyond existing XP, Focus Tokens, phone time, rewards, and Weekend Bank
- Organization dashboards

## Relationship to Guardian Nudges (Phase C1)

Core Challenges may later connect to Guardian Nudges.

**Example:**

- Challenge: Practice Spanish 30 minutes every weekday
- Nudge: Tell parent if not started 2 hours before due time
- Reward: 20 XP + 15 minutes earned digital freedom

Guardian Nudges should remain parent-first.

**C.U.B. Code informs the guardian. The guardian decides the response.**

Nudges on challenges report interval state (not started, not submitted, overdue). They do not punish, nag the child by default, or trigger automatic consequences.

Future `GuardianNudgeRule` (or successor) should support optional linkage to `Challenge` / `ChallengeProgressLog`, not only `Task`.

## Relationship to Tasks

| | Task | Challenge |
|---|------|-----------|
| Scope | Single action, one completion cycle | Repeatable program across intervals |
| Recurrence | Optional simple recurrence on `Task` / `TaskTemplate` | First-class interval + target model |
| Progress | Task status state machine | Per-interval `ChallengeProgressLog` |
| Proof | Per submission | Per interval window |
| Rewards | On approval of that task | On approval of each interval (or configured cadence) |

Tasks remain valid for one-off work. Challenges are for ongoing agreements. Do not force all chores into challenges or all challenges into the task board without explicit product design during implementation approval.

## Relationship to Focus Deck (Phase C2B)

Focus Deck (`/docs/PHASE_C2B_FOCUS_DECK.md`) is a **later** roadmap item. Ship `BINARY_ROUTINE` (and ideally numeric challenges) before Focus Deck.

| | Challenge | Focus Activity Card |
|---|-----------|---------------------|
| Shape | Repeatable program with interval + target | Parent-approved card; Cub picks from weekly stack |
| Growth | Optional single tag | Multi-area weighted point spread |
| Best for | Ongoing agreements (practice, chores, grade checks) | Rich development activities (walk + journal, elder interview, room reset) |

Both may feed the same weekly growth graph and ledger system. Do not merge models without an approved schema plan.

## Prerequisites

Build in order:

1. **Phase B complete** — stable task loop, approval flow, ledgers, parent dashboard
2. **Phase C2 schema approval** — explicit sign-off on models and enums before migrations
3. **BINARY_ROUTINE first** — simplest proof and approval path
4. **NUMERIC_TRACKED** — Cub logging + parent approval
5. **PARENT_VERIFIED_DATA** — parent verification input only (no external sync)
6. **Guardian Nudge linkage** (optional, after Phase C1 in-app nudges) — rules scoped to active challenges

Phase C2 does not require Phase C1 Guardian Nudges to ship first, but nudge-on-challenge is a later enhancement.

## Out of Scope (Phase C2 and beyond unless separately approved)

- School portal / Google Classroom / gradebook API integrations
- AI challenge generation or coaching
- Public or cross-family challenge templates
- Child-to-child or social challenge features
- Automatic punishment or device control tied to challenge failure
- New currencies or reward types outside existing ledgers and Reward Store
- Replacing the task board with challenges-only UX

## Cursor Instruction

When this document is **not** approved:

- Do not add challenge tables, routes, cron jobs, or UI.
- Do not extend `Task` / `TaskTemplate` to silently absorb challenge semantics without an approved schema plan.

When this document **is** approved for implementation:

1. Ship `BINARY_ROUTINE` end-to-end before numeric or parent-verified types.
2. Reuse existing approval patterns, ledger reasons, and proof privacy rules.
3. Preserve parent-first philosophy and Manual Enforcement Rule.
4. Keep JSON config minimal — typed fields for common data.
5. Do not add excluded integrations or social features.
