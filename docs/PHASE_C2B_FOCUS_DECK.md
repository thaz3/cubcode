# Focus Deck — Multi-Area Activity Cards

## Version
0.3 — Approved for Implementation (C2B in progress)

## Status
**Implementation in progress.** Phase C2 `BINARY_ROUTINE` exit criteria are met. Focus Deck (C2B) application code is being added per this document.

Phase C2B is a **separate roadmap item** from Phase C2 (Core Challenges). Ship `BINARY_ROUTINE` end-to-end before starting Focus Deck.

**Naming note:** Phase C2B is not the same as Guardian Nudge delivery stage “C2” (parent email) inside `/docs/PHASE_C_GUARDIAN_NUDGES.md`.

Referenced in:

- `/docs/MVP_SCOPE.CONTRACT.md` (MVP Excludes / Post-MVP Roadmap)
- `/docs/CURSOR_PROJECT_RULES.md` (Do Not Implement / Focus Deck section)
- `/docs/PHASE_C2_CORE_CHALLENGES.md` (Relationship to Focus Deck)
- `/docs/PHASE_C_GUARDIAN_NUDGES.md` (Relationship to Phase C2B)

## Purpose

Focus Deck gives parents a stack of parent-approved activity cards that Cubs can choose from. Each card represents a real-world focus activity that can build multiple growth areas at once.

This helps C.U.B. Code move beyond chores and simple tasks into a youth development system.

Core idea:

**One activity can grow more than one part of the child.**

## Product Philosophy

C.U.B. Code remains:

**Control. Use. Build.**

The Focus Deck supports the five growth areas:

- Character
- Wellness
- Creativity
- Responsibility
- Community

Parents remain in control. Cubs may choose from a parent-approved stack, but parents decide which cards are available and what counts as complete.

The app does not punish, shame, or decide consequences.

## Product Promise Alignment

Focus Deck extends the existing promise:

**C.U.B. Code calculates earned digital freedom. Parents control access.**

Focus Cards add **multi-area youth development activities** with the same approval loop. They do not add device control, automatic consequences, or parent bypass.

## User Experience

### Parent side

- Create Focus Activity Card
- Choose category point values
- Set proof type
- Set reward
- Add cards to a weekly stack
- Assign or make cards available to a Cub
- Review submitted card completions
- See weekly growth balance

### Cub side

- View available Focus Cards
- Pick a card
- Complete the real-world activity
- Submit proof / reflection / checklist
- See earned rewards and growth points after approval

## Focus Activity Card Fields

Each card should include:

- Title
- Description
- Activity instructions
- Estimated time
- Location type (optional)
- Difficulty
- Proof type
- Reward
- Category point spread

Category points may apply to more than one growth area.

Example category point spread:

- Wellness +2
- Creativity +2
- Character +1

## Growth Areas

Use these five growth areas:

1. Character
2. Wellness
3. Creativity
4. Responsibility
5. Community

Most cards should touch 1–3 categories.

Special cards may touch 4–5 categories, but not every card should do this.

**Implementation note:** Current production growth boards may still use Control / Use / Build / Character / Wellness. Focus Deck introduces the five-area model above as the target taxonomy when this phase is approved. Migration or mapping from legacy area labels should be planned during schema approval, not assumed in this document.

## Example Cards

### Walk + Witness

**Activity:**
Walk 2 miles at a park. Then sit somewhere and draw, write, or journal what you noticed.

**Points:**

- Wellness +2
- Creativity +2
- Character +1

**Proof:**
Short reflection or image of journal/sketch, parent-approved.

### Elder Performance

**Activity:**
Create a 1-minute performance piece, poem, dance, speech, or song for an elder family member.

**Points:**

- Creativity +3
- Community +2
- Responsibility +1
- Character +2
- Wellness +1

**Proof:**
Parent confirmation or short reflection.

### Room Reset

**Activity:**
Clean your room and explain one habit that would help keep it clean.

**Points:**

- Responsibility +3
- Character +2

**Proof:**
Checklist confirmation or parent review.

### Family Interview

**Activity:**
Ask an elder 5 questions and summarize what you learned.

**Points:**

- Community +3
- Character +2
- Creativity +1

**Proof:**
Written summary or parent confirmation.

## Relationship to Existing Systems

Focus Deck should **not** replace Tasks or Challenges.

It should be a template/card layer that feeds the same approval and reward loop:

**Focus Card → Activity → Proof → Parent Approval → Earned Digital Freedom**

| | Task | Challenge | Focus Activity Card |
|---|------|-----------|---------------------|
| Scope | Single action, one completion cycle | Repeatable program across intervals | Parent-approved activity card; Cub picks from stack |
| Growth | Optional single growth tag | Optional tags per challenge | **Multi-area weighted point spread** |
| Recurrence | Optional simple recurrence | First-class interval + target | Weekly stack / availability window |
| Proof | Per submission | Per interval window | Per card completion |
| Rewards | On approval of that task | On approval of each interval | On approval of that card |

Approved Focus Cards should contribute to the **weekly growth balance graph**.

The graph should eventually reflect approved work from:

- Tasks
- Routines
- Challenges
- Focus Activity Cards

Tasks remain valid for one-off chores and assignments. Challenges remain valid for repeatable agreements (`/docs/PHASE_C2_CORE_CHALLENGES.md`). Focus Deck is for **rich, multi-area development activities** the Cub chooses from a parent-curated deck.

## Possible Data Model Direction

Possible future models:

- `FocusActivityCard`
- `FocusActivityCompletion`
- `FocusActivityCategoryPoint`

For early implementation, category points may be stored as structured JSON if that keeps the first build simpler.

Example:

```json
{
  "wellness": 2,
  "creativity": 2,
  "character": 1
}
```

Do not overbuild analytics yet.

### Suggested fields (conceptual)

**`FocusActivityCard` (family-scoped template or instance):**

- `familyId`, `createdByUserId`
- `title`, `description`, `instructions`
- `estimatedMinutes`, `locationType` (optional), `difficulty`
- `proofType` (reuse existing proof enums)
- Reward fields aligned with existing task reward shape
- `categoryPoints` (JSON — see example above)
- `status` (draft, active, archived)
- Optional weekly stack / availability config

**`FocusActivityCompletion`:**

- `cardId`, `cubId`
- `status` (claimed, in progress, submitted, sent back, rejected, approved, completed)
- `proofPayload` (JSON)
- `submittedAt`, `reviewedAt`, `reviewedByUserId`
- Ledger linkage on approval (reuse existing XP, Focus Tokens, phone time reasons)

Prefer reusing the existing task approval state machine patterns where possible.

## Constraints

Do **not** add:

- Public card marketplace
- AI-generated cards
- Social sharing
- Child-to-child competition
- GPS
- Messaging
- Device control
- Automatic punishment
- School portal sync
- Organization dashboards
- SMS / email / push reminders

## Relationship to Guardian Nudges (Phase C1)

Focus Deck may later connect to Guardian Nudges (e.g. alert parent if a card in the weekly stack has not been started). Nudge linkage is a **later enhancement** after Focus Deck completion and approval flows exist.

Guardian Nudges remain parent-first:

**C.U.B. Code informs the guardian. The guardian decides the response.**

## Future Implementation Suggestion

Treat Focus Deck as a **future C2B or C3 feature** after Binary Routine Challenges are stable.

Recommended build order:

1. Document Focus Deck *(this document)*
2. Add growth area enum/constants
3. Add card templates
4. Add parent-created cards
5. Add Cub card selection
6. Add proof / submission / review
7. Add category points to weekly growth graph
8. Add starter card library

### Prerequisites (summary)

1. **Phase B complete** — stable task loop, approval flow, ledgers, parent dashboard
2. **Phase C2 `BINARY_ROUTINE` stable** — simplest repeatable challenge path proven end-to-end
3. **Phase C2B schema approval** — explicit sign-off on models, growth area enum/constants, and graph integration before migrations

Phase C2B does not require Phase C1 Guardian Nudges to ship first, but nudge-on-focus-card is a later enhancement.

## Out of Scope (Phase C2B and beyond unless separately approved)

- Public card marketplace or cross-family sharing
- AI-generated activity cards or coaching
- Social leaderboards or child-to-child comparison
- GPS or location-verified completion
- Device control or automatic punishment tied to card state
- New reward currencies outside existing ledgers and Reward Store
- Replacing the task board or challenge flows with Focus Deck only
- School portal sync

## Cursor Instruction

When this document is **not** approved:

- Do not add Focus Deck tables, routes, cron jobs, or UI.
- Do not extend `Task` / `Challenge` to silently absorb Focus Deck semantics without an approved schema plan.

When this document **is** approved for implementation:

1. Ship after Phase C2 `BINARY_ROUTINE` is stable.
2. Reuse existing approval patterns, ledger reasons, and proof privacy rules.
3. Preserve parent-first philosophy and Manual Enforcement Rule.
4. Keep JSON config minimal — typed fields for common data.
5. Do not add excluded integrations, social features, or AI card generation.
