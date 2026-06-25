# C.U.B. Code Phase C — Guardian Nudges

## Version
0.1 — Roadmap Concept (Not Approved for Implementation)

## Status
**Documentation only.** Do not implement application code until this document is explicitly approved and scheduled after Phase B exit criteria are met.

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

## Data Model (Conceptual — Not for Implementation Yet)
Future implementation may need:
- `ReminderRule` (parent-owned, family-scoped, linked to task or milestone)
- `ReminderEvent` or delivery log (audit, deduplication, rate limiting)
- Parent notification preferences (email/SMS opt-in, quiet hours)
- “Last touched” derived from existing task/progress events — prefer derivation over duplicate tracking where possible

Schema design awaits explicit Phase C approval.

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

Guardian Nudges add **scheduled, rule-based, parent-configured awareness** — a new capability, scoped to **Phase C**.

## Out of Scope (Phase C and beyond unless separately approved)
- Automatic device locking/unlocking triggered by reminders
- Child shame scoring or “behavior risk” labels
- Escalation chains that message teachers, coaches, or third parties
- Push notifications to native apps (native apps remain deferred)
- Reminder-driven reward penalties
- AI-suggested parenting responses
- Cross-family reminder templates marketplace

## Cursor Instruction
When this document is approved for implementation:
1. Ship C1 (in-app only) first.
2. Preserve parent-first delivery and neutral copy in all channels.
3. Do not add child phone fields until C3 is explicitly approved.
4. Do not connect reminders to reward overrides or device control APIs (none exist in MVP).

When this document is **not** approved: do not add reminder tables, routes, cron jobs, or notification integrations.
