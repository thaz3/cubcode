We are starting Phase B implementation for the C.U.B. Code MVP.

Do not write implementation code yet.

First update the project documentation so future Cursor work stays focused.

Read these existing files:

* `/docs/MVP_SCOPE.CONTRACT.md`
* `/docs/CURSOR_PROJECT_RULES.md`
* `REVIEW_PACKET.md` if present

Create a new file:

* `/docs/PHASE_B_SCOPE.CONTRACT.md`

Then update:

* `/docs/CURSOR_PROJECT_RULES.md`

Phase B theme:

Tighten + sharpen + deepen the existing MVP loop.

Phase B should strengthen the core loop, not expand the product surface area.

Core loop:

Task → Focus → Proof → Approval → Earned Digital Freedom

Phase B priorities, in order:

1. Privacy + proof alignment

* Remove or hide risky proof types such as PERFORMANCE_VIDEO and SLIDESHOW from the MVP user-facing flow.
* Default MVP proof types should be text reflection, checklist confirmation, and only optional tightly scoped private upload if already supported.
* No public media, no child exposure, no moderation-heavy proof workflows.

2. Task workflow UI consolidation

* Unify duplicated Cub task workflow and parent-proxy task workflow into shared components.
* Do not change product behavior unless required.
* Goal: same task state behavior, fewer duplicated UI paths, easier maintenance.

3. Earned Digital Freedom clarity

* Make approval moments clearer and more emotionally satisfying.
* Show exactly what was earned after approval.
* Improve transparency around XP, Focus Tokens, phone time, and Weekend Bank changes.
* No new reward mechanics.

4. Parent dashboard friction reduction

* Make review faster.
* Improve empty states.
* Audit and tune Today / next-action logic.
* Parent should immediately know what needs attention.

5. Cub iPad and mobile polish

* Improve touch-first layouts.
* Improve iPad layout at larger breakpoints.
* No native mobile app.
* No new architecture.

6. UI primitive migration

* Refactor high-traffic screens to use existing or improved UI primitives.
* Focus first on Parent Today, Review, and Cub Today.
* Reduce raw Tailwind duplication where practical.

Phase B exclusions:

Do not add:

* New reward systems
* Streaks
* New gamification layers
* New task categories
* Messaging
* Device integrations
* AI features
* Analytics dashboards
* Multi-parent roles
* GPS
* Public child profiles
* Organization dashboards
* Marketplace features
* Native mobile app
* Crypto / zero-knowledge features

Cursor rules update:

Add an “Active Phase: Phase B” section to `/docs/CURSOR_PROJECT_RULES.md`.

That section should say:

* Phase B is refinement, not expansion.
* Cursor must not add new product features without explicit approval.
* Cursor must propose a small plan before each Phase B implementation step.
* Cursor must keep database schema changes out of Phase B unless absolutely necessary and explicitly approved.
* Cursor must preserve family scoping and privacy boundaries.
* Cursor must prioritize mobile and iPad usability.
* Cursor must keep proof/accountability private and low-risk.
* Cursor must avoid duplicating task workflow logic.
* Cursor must use UI primitives consistently where practical.

After updating docs, summarize:

1. What files were created or changed
2. What Phase B now allows
3. What Phase B forbids
4. Recommended first implementation task
5. Any questions or conflicts found

Do not write implementation code yet.
