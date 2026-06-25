# C.U.B. Code Phase C1 — Small Reminders

## Product name
**Small Reminders** is the parent-facing name for Phase C1 in-app reminders (internal code: Guardian Nudges).

## Version
0.2 — C1 In-App Implementation

## Status
**Phase C1 (Small Reminders, in-app) is implemented** in the parent dashboard and family settings.

- Delivery: in-app parent cards and nav badge only
- Parent-first: C.U.B. Code informs the guardian; the guardian decides the response
- No SMS, email, push notifications, or child-facing reminders in C1

**Phase C2 (Core Challenges)** remains documentation-only. See `/docs/PHASE_C2_CORE_CHALLENGES.md`.

**Naming note:** Delivery stages inside this feature (in-app, email, SMS, Cub) are labeled C1–C4 *within Guardian Nudges*. Those labels are not the same as Phase C1 / Phase C2 product phases.

## Feature Names (aliases)
- **Guardian Nudges** (preferred)
- Guardian Awareness Layer
- Parent-First Nudges

## Core Principle
**C.U.B. Code informs the guardian. The guardian decides the response.**

Guardian Nudges must always remain **parent-first**.

The app:
- Alerts the parent or guardian when an agreed-upon task, goal, or milestone has not been **touched** by a parent-defined time.
- Supports parental awareness.

The app does **not**:
- Nag the child
- Punish the child
- Remove access automatically
- Decide consequences
- Replace parental judgment

The parent decides what happens next based on household, parenting style, child age, context, and family values.

### Valid parent responses (all outside the app)
After receiving a nudge, a parent may:
- Gently remind the child
- Pause device access (manually, per existing Manual Enforcement Rule)
- Sit with the child and help them get unstuck
- Ignore the reminder because they already know the context

The app never prescribes which response is correct.

## Product Promise Alignment
Guardian Nudges extend the existing promise:

**C.U.B. Code calculates earned digital freedom. Parents control access.**

Nudges add **awareness**, not **enforcement**. They do not change reward mechanics, override rules, or device control posture.

## How It Works (Concept)

### 1. Co-created expectation
A parent and Cub sit down together and set a task, goal, assignment, or milestone in the app (using existing task/milestone flows).

### 2. Optional parent-defined reminder rule
The parent may optionally attach a **reminder rule** to that item. Examples:
- Tell me if this has not been started **2 hours before the deadline**
- Tell me if this is **overdue**
- Tell me when this is **submitted for review**
- Send me a **daily parent summary**

Reminder rules are:
- Created by the parent
- Editable by the parent
- Disableable by the parent
- Scoped to the parent’s family only

### 3. “Touched” definition
A task or milestone counts as **touched** when the Cub has performed a meaningful supported action already recognized by the app, such as:
- Claimed the task
- Started a focus block
- Submitted proof or reflection
- Checked off a checklist item
- Any other valid progress event already supported by the task state machine or activity log

If none of these have occurred by the rule’s evaluation time, the parent may receive a nudge. The app does not infer intent, effort quality, or blame.

### 4. Parent-only delivery (initial)
First versions deliver reminders **only to parents/guardians**, never to the child by default.

## Reminder Delivery Roadmap

| Stage | Channel | Notes |
|-------|---------|-------|
| **C1** | In-app parent reminder cards / badges | First build. No external PII beyond existing parent account. |
| **C2** | Parent email reminders | Parent opt-in required. Use parent email on file. |
| **C3** | Parent SMS reminders | Opt-in only. Parent phone number only — **no child phone collection**. |
| **C4** | Cub reminders (if ever) | Only later, if explicitly approved, parent-controlled, preset messages only — never free-form |

Stages must ship in order. Later stages require explicit approval and privacy review.

## Message Tone
Neutral, factual, non-shaming.

**Good example:**
> C.U.B. Code: Jordan has not started “Math Review” yet. It is due at 6:00 PM.

**Avoid:**
- Jordan failed
- Jordan ignored the task
- Jordan is behind
- Punishment required
- Device access revoked

Nudges report state. They do not judge character or mandate action.

## Hard Constraints
Guardian Nudges must never:
- Bypass parent authority
- Become a consequence engine
- Change reward mechanics
- Trigger automatic punishment
- Trigger automatic device control
- Collect child phone numbers in the first version (C1–C2)
- Enable child-to-child messaging
- Enable free-form messaging
- Use GPS or location triggers
- Add social features or public profiles
- Spam notifications
- Generate AI parenting advice
- Nag the child without explicit, parent-approved Cub delivery (C4+ only)

## Parent Opt-In Requirements
| Delivery | Opt-in |
|----------|--------|
| In-app cards/badges | On by default for enrolled reminder rules; parent configures rules per task/family |
| Email | Explicit opt-in per parent account |
| SMS | Explicit opt-in per parent account; separate from email |
| Cub-facing | Parent-controlled per Cub; off by default; never in C1 |

Parents can disable all external channels and use in-app only.

## Data Model (Implemented for C1)
C1 uses family-scoped tables:

- `GuardianNudgeRule` — parent-owned reminder rule toggles per family
- `GuardianNudgePreferences` — quiet hours, timezone, daily summary time
- `GuardianNudge` — in-app delivery log with dedupe keys and ACTIVE / SEEN / DISMISSED status

“Touched” is derived from existing task progress (status, focus blocks, checklist, proof) — not from `CLAIMED` alone.

Per-task reminder rules remain a future enhancement. C1 uses family-wide rule toggles.

## C1 Implementation Notes
- Sync runs on dashboard layout load and after key task actions (assign, start, focus log, submit, review)
- One nudge per task at a time (priority: review → overdue → due soon → no action)
- `SUBMITTED_FOR_REVIEW` nudges cannot be dismissed — only marked seen or reviewed
- Disabling a rule dismisses existing ACTIVE / SEEN nudges of that type
- Quiet hours hide dashboard cards and return nav badge count `0`

## Prerequisites Before Parent SMS (C3)
Build in order:

1. **Phase B complete** — stable parent dashboard, review flow, and task state accuracy
2. **C1 in-app Guardian Nudges** — reminder rules, touched evaluation, in-app cards/badges, deduplication, quiet hours, parent rule CRUD
3. **C2 parent email** — opt-in UI, unsubscribe, delivery logging, rate limits, neutral copy templates
4. **Privacy + compliance review** — consent records, data retention policy for delivery logs, no child phone fields
5. **Operational readiness** — bounce handling, failed delivery retry policy, support runbook
6. **Only then C3 SMS** — separate opt-in, parent phone on parent account only, TCPA/consent alignment, cost controls

Do not skip to SMS before in-app and email paths prove reliable and low-noise.

## Relationship to Phase B
Phase B may improve how parents see **current** attention items (submitted tasks, overdue display, next-action card). That is existing-data surfacing, not Guardian Nudges.

Guardian Nudges add **scheduled, rule-based, parent-configured awareness** — a new capability, scoped to **Phase C1**.

## Relationship to Phase C2 (Core Challenges)
Core Challenges (`/docs/PHASE_C2_CORE_CHALLENGES.md`) are a separate Phase C capability.

Challenges may optionally attach Guardian Nudge rules (e.g. alert parent if a weekday practice interval has not been started). Nudge linkage is a **later enhancement** after both Phase C1 in-app nudges and Phase C2 challenge loops exist.

Guardian Nudges on challenges follow the same parent-first principle: inform the guardian; the guardian decides the response.

## Out of Scope (Phase C and beyond unless separately approved)
- Automatic device locking/unlocking triggered by reminders
- Child shame scoring or “behavior risk” labels
- Escalation chains that message teachers, coaches, or third parties
- Push notifications to native apps (native apps remain deferred)
- Reminder-driven reward penalties
- AI-suggested parenting responses
- Cross-family reminder templates marketplace

## Cursor Instruction
When extending Guardian Nudges:

1. Preserve C1 in-app, parent-first delivery and neutral copy.
2. Do not add child phone fields, SMS, email, or push without explicit approval and the delivery roadmap order below.
3. Do not connect reminders to reward overrides or device control APIs (none exist in MVP).
4. Do not implement Phase C2 Core Challenges from this document.

### Future delivery (not yet implemented)
Parent email (Guardian Nudges C2), SMS (C3), and Cub-facing reminders (C4) are **not implemented**. See **Reminder Delivery Roadmap** above.
