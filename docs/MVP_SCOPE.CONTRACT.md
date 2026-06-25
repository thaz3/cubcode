# C.U.B. Code MVP Scope Contract

## Version
0.2 — Pre-Build Alignment Document

## Project Name
C.U.B. Code MVP

## Core Build Goal
Build a responsive web MVP that proves the first household loop:

**Task → Focus → Proof → Approval → Earned Digital Freedom**

The MVP helps parents replace screen-time battles with real-world tasks, Focus Blocks, approval, rewards, and reflection. The goal is not to build the full long-term platform. The goal is to prove that the core household system works in real family life.

## Core Product Promise
**C.U.B. Code calculates earned digital freedom. Parents control access.**

The MVP does not lock phones, block apps, or automatically control devices.

The app supports parenting. The app does not replace parenting.

## C.U.B. Meaning
C.U.B. means **Control. Use. Build.**

A Cub earns digital freedom by proving they can control their focus, use tools with intention, and create value beyond the screen.

## Tech Stack
Use this stack for speed and simplicity:

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS

Build as a responsive web application first. Native mobile apps are deferred until after household loop validation.

## MVP Must Prove
The MVP must answer these questions:

1. Can a parent set up one family quickly?
2. Can a parent create one Cub profile?
3. Can a parent select an age band and basic household rules?
4. Can a parent create or choose simple tasks?
5. Can a Cub understand what to do?
6. Can a Cub log completed effort?
7. Can a parent approve, reject, or send back the task?
8. Can the app calculate XP, Focus Tokens, earned phone time, and Weekend Bank credit?
9. Can parents set limits so rewards do not become unlimited screen access?
10. Can the household use the system for one full week?
11. Can the system include simple summer/outdoor tasks without becoming a public meetup platform?

## MVP Includes

### Family Core
The MVP includes:

- Parent account
- Family creation
- Cub profile
- Age band selection
- Family settings
- Task templates
- Task Board
- Task claiming
- Task completion logging
- Focus Block logging
- Parent approval
- Parent rejection
- Send-back for revision
- XP ledger
- Focus Token ledger
- Phone-time ledger
- Weekend Bank ledger
- Reward Store
- Rank progress
- Council Day prompts
- Basic progress view
- Manual device enforcement

### Age Bands
Use these age bands:

- Little Cubs: ages 5–7
- Core Cubs: ages 8–11
- Trail Cubs: ages 12–15
- Legacy Builders: ages 16–18

Age bands should support default guidance for:

- Focus Block length
- Proof style
- Suggested phone caps
- Council Day length
- Parent supervision level

### Cub Mode
For MVP, Cubs are parent-managed profiles, not independent public users.

Parents have real user accounts. Cubs do not need independent email/password accounts for the first build. Cubs do not have public profiles, cannot message other children, cannot discover public meetups, and cannot approve their own work.

A Cub may eventually access a limited supervised view to:

- View assigned tasks
- Claim tasks
- Start or log Focus Blocks
- Submit proof or reflection
- View approval status
- View XP
- View Focus Tokens
- View earned phone-time credit
- View rank progress
- Prepare for Council Day

### Weekly Legacy Task
The MVP includes one optional Weekly Legacy Task category.

Weekly Legacy Tasks help Cubs build Black history awareness, family identity, cultural memory, elder connection, neighborhood knowledge, and community pride.

For MVP, Weekly Legacy Tasks are simple task templates selected by the parent or admin. The app does not generate historical content automatically.

A Weekly Legacy Task may include:

- Learning about a Black historical figure
- Interviewing an elder
- Researching a Black inventor, artist, organizer, athlete, entrepreneur, or technologist
- Visiting or observing a community location
- Reflecting on family history
- Connecting Black history to present-day responsibility

Do not build a full curriculum engine, AI lesson generator, cultural archive, or Legacy Vault for MVP.

### Cub Code Live Lite
The MVP includes a simple summer/outdoor task layer called **Cub Code Live Lite**.

Cub Code Live Lite may include:

- Summer Task Board
- Parent-selected outdoor tasks
- Admin-created summer/community task templates
- Park tasks
- Library tasks
- Walking observation tasks
- Family history tasks
- Creative outdoor tasks
- Community service tasks
- Location description
- Age range
- Supervision level
- Proof requirement
- XP / Focus Token reward
- Parent final approval

Cub Code Live Lite does not include full public events, open host dashboards, child discovery, or live GPS.

## MVP Excludes
The MVP does not include:

- Automated phone locking or unlocking
- Apple Screen Time integration
- Google Family Link integration
- Native mobile apps
- Child email/password accounts
- Open child profiles
- Child-to-child messaging
- Public social networking
- Live GPS tracking
- Public meetup discovery for children
- Peer bonus voting
- Full organization dashboards
- Self-service host accounts
- Self-service public event creation
- Full partner marketplace
- Legacy Vault
- Rust cryptographic core
- Local-first encrypted event sync
- Zero-knowledge database claims
- Complex fraud detection
- AI recommendations
- Citywide map game mechanics
- Advanced analytics
- **Guardian Nudges / parent reminder rules** (see Phase C: `/docs/PHASE_C_GUARDIAN_NUDGES.md`)
- **Child-facing reminders or push notifications**
- **Parent email or SMS reminders**
- **Automatic consequences or punishment flows triggered by task state**
- **Consequence engines that bypass parent judgment**

These may be considered later only after the family behavior loop is proven.

## Manual Enforcement Rule
For MVP, C.U.B. Code does not control the child’s phone directly.

The app calculates:

- Earned phone time
- XP
- Focus Tokens
- Weekend Bank
- Reward eligibility
- Rank progress

The parent controls actual access to the device.

MVP language must be clear:

**C.U.B. Code calculates earned digital freedom. Parents control access.**

Do not claim that the MVP locks, unlocks, blocks, or controls apps automatically.

Future reminder features (Phase C Guardian Nudges) must follow the same rule: the app may inform the guardian; the guardian decides the response. Reminders must not nag the child, punish the child, or remove access automatically.

## Core User Roles

### Parent / Guardian
The Parent can:

- Create an account
- Create a family
- Create a Cub profile
- Select age band
- Set phone-time rules
- Set daily caps
- Set Weekend Bank limits
- Choose or create tasks
- Review task claims
- Approve, reject, or send back work
- Manage rewards
- View progress
- Run Council Day

### Cub
The Cub is a parent-managed profile for MVP.

The Cub can eventually:

- View available tasks
- Claim or receive a task
- Start or log a Focus Block
- Submit completion details
- Add proof or reflection
- View approval status
- View earned XP
- View Focus Tokens
- View rewards
- Prepare for Council Day

The Cub cannot:

- Approve their own work
- Change household rules
- Change phone caps
- Create public tasks
- Message other children
- Discover public meetups
- View other children’s profiles
- Change rewards
- Bypass parent approval

### Admin
For MVP, Admin is limited.

The Admin can:

- Create starter task templates
- Create summer/community task templates
- View basic system data
- Support family pilot setup

The Admin should not manage a full public organization platform in MVP.

## Core Workflow
The MVP workflow is:

1. Parent creates an account.
2. Parent creates a family.
3. Parent creates a Cub profile.
4. Parent selects an age band.
5. Parent sets daily phone-time cap, Weekend Bank cap, and exchange rules.
6. Parent chooses starter tasks.
7. Cub claims or receives a task.
8. Cub completes the task offline.
9. Cub logs completion, time, proof, or reflection.
10. Parent reviews the claim.
11. Parent approves, rejects, or sends it back.
12. Approved work earns XP, Focus Tokens, phone-time credit, reward access, or Weekend Bank credit.
13. Parent manually releases or withholds device access based on household rules.
14. Progress is reviewed during Council Day.

## Task State Machine
Use these task states:

- Available
- Claimed
- In Progress
- Submitted
- Sent Back
- Rejected
- Approved
- Completed

Definitions:

- Available: Task can be selected.
- Claimed: Cub has chosen or accepted the task.
- In Progress: Cub has started the task or Focus Block.
- Submitted: Cub says the task is done and awaits parent review.
- Sent Back: Parent requires correction or retry.
- Rejected: Parent denies completion; no reward is earned.
- Approved: Parent accepts completion.
- Completed: Rewards have been calculated and applied.

Rule: **No task is completed until the responsible adult approves it.**

Approved equals the human decision. Completed equals the system reward processing is finished.

## Parent Approval Rules
A parent may approve a task when:

- The task was completed
- The proof is acceptable
- The effort meets the household standard
- The child was honest
- The task matches the stated requirement

A parent may reject or send back a task when:

- The task was not completed
- The proof is missing
- The work was rushed or careless
- The child was dishonest
- The task needs correction
- The task created a safety or behavior concern

## Parent Override Rules
Parents may pause, reduce, restore, expire, or adjust rewards.

Reason codes:

- Safety
- Sleep
- School
- Dishonesty
- Disrespect
- Serious misuse
- Parent correction
- Other

Override actions:

- Pause earned time
- Reduce available phone time
- Expire phone time
- Restore phone time
- Manual adjustment
- Require repair task

## Reward Economy Rules
The MVP reward economy must include guardrails.

Rules:

- Earned does not mean unlimited.
- Daily caps always apply.
- Weekend Bank caps always apply.
- Sleep rules override rewards.
- School needs override rewards.
- Safety concerns override rewards.
- Dishonest work earns nothing until repaired.
- Parents should not casually erase earned time without a clear reason.
- Parents can pause rewards for safety, disrespect, dishonesty, sleep, school, or serious misuse.

## Suggested Starting Exchange
Default exchange model:

- 30-minute Focus Block = 15 minutes recreational phone time
- Daily Task = 10–20 minutes phone time or 1 Focus Token
- Weekly Quest = up to 4 hours weekend time, 2–4 Focus Tokens, or non-digital reward
- Boss Battle = major reward, badge, rank bonus, or Weekend Bank bonus
- Council Day = bonus XP, Focus Token, or rank credit

These are defaults only. Parents can adjust them.

## Ledger Rule
Use simple ledgers for all balances. Do not only store current totals.

Create ledgers for:

- XP
- Focus Tokens
- Phone-time minutes
- Weekend Bank minutes

Each ledger entry should include:

- Cub ID
- Amount
- Reason
- Source task ID when applicable
- Created by
- Created at
- Note when applicable

## MVP Data to Store
The MVP may store:

- Parent account
- Family
- Cub profile
- Age band
- Family settings
- Task templates
- Assigned tasks
- Task status
- Focus Block logs
- Approval status
- XP ledger entries
- Focus Token ledger entries
- Phone-time ledger entries
- Weekend Bank ledger entries
- Reward Store items
- Council Day notes or prompts
- Basic timestamps

Avoid storing sensitive proof unless necessary.

## Proof and Privacy Rules
The MVP should use minimal proof.

Preferred proof types:

- Parent approval only
- Short written reflection
- Checklist
- Photo of completed work, not the child
- Simple time log

Avoid by default:

- Child face photos
- Videos of children
- Audio recordings
- Precise location history
- Public proof galleries
- Host-visible child profiles

Privacy principle: **Accountability without exposure.**

## Cub Code Live Lite Rules
Cub Code Live Lite is included only as a parent-controlled summer task board.

It may include:

- Park task
- Library task
- Walking observation task
- Family history task
- Community cleanup task
- Creative outdoor task
- Admin-created event-style task

It must not include:

- Child-discovered meetups
- Random child-to-child events
- Public child profiles
- Open messaging
- Live location tracking
- Self-service public host posting

Core safety rule:

**Families discover trusted tasks. Children do not discover strangers.**

## Success Metrics
The MVP succeeds if:

- Parents can set up the system without confusion
- Cubs understand how to earn access
- Families use the system for at least one week
- Parents report fewer screen-time arguments
- Cubs complete real-world tasks
- Focus Blocks are logged consistently
- Earned phone time is easier to manage
- Reward caps prevent binge behavior
- Council Day creates useful reflection
- Summer tasks help families get outside or do offline activities

## Build Order
Build in this order:

1. Authentication
2. Parent account
3. Family creation
4. Cub profile
5. Age band selection
6. Family settings
7. Task templates
8. Task Board
9. Task claiming
10. Focus Block logging
11. Task submission
12. Parent approval / rejection / send-back
13. XP ledger
14. Focus Token ledger
15. Phone-time ledger
16. Daily cap calculation
17. Weekend Bank ledger
18. Reward Store
19. Rank progress
20. Council Day prompts
21. Basic progress dashboard
22. Weekly Legacy Task templates
23. Summer Task Board Lite
24. Admin-created summer/community task templates

## Milestone 1: Household Setup
Build Milestone 1 first.

Milestone 1 includes:

- Parent sign up / login
- Family creation
- Cub profile creation
- Age band selection
- Family settings:
  - daily_phone_cap_minutes
  - weekend_bank_cap_minutes
  - default_exchange_rate

Exit criteria:

- Parent can create an account.
- Parent can create one family.
- Parent can create one Cub.
- Parent can choose the Cub’s age band.
- Parent can set basic household rules.

Do not build tasks, rewards, ledgers, Council Day, or summer tasks until Milestone 1 is complete.

## Milestone 2: Task Loop
Build:

- Task templates
- Task Board
- Claim task
- Start/log Focus Block
- Submit task
- Parent approve/reject/send back

Exit criteria:

- Cub can claim and submit a task.
- Parent can review it.
- Task state changes correctly.

## Milestone 3: Reward Economy
Build:

- XP ledger
- Focus Token ledger
- Phone-time ledger
- Daily cap display/calculation
- Weekend Bank ledger
- Reward Store
- Rank progress

Exit criteria:

- Approved task creates ledger entries.
- Earned time respects daily cap.
- Parent can see available phone time.
- Cub can see progress.

## Milestone 4: Reflection + Summer Lite
Build:

- Council Day prompts
- Basic progress dashboard
- Weekly Legacy Task templates
- Summer Task Board Lite
- Admin-created summer/community tasks
- Parent-selected outdoor tasks

Exit criteria:

- Family can complete one full week.
- Parent can run Council Day.
- Parent can choose summer/outdoor tasks.
- No public event, social, or location features exist.

## Cursor Instruction
When building in Cursor, follow this scope contract strictly.

Do not add features outside this MVP unless explicitly approved.

When there is a conflict between the long-term vision and this MVP Scope Contract, this MVP Scope Contract wins.

The goal is not to build the entire C.U.B. Code platform. The goal is to prove the first household loop:

**Task → Focus → Proof → Approval → Earned Digital Freedom**

## Post-MVP Roadmap (Reference Only)
The following are documented for alignment but are **not** MVP or Phase B scope:

| Phase | Theme | Key document |
|-------|-------|--------------|
| Phase B | Refinement of the existing loop | `/docs/PHASE_B_SCOPE_CONTRACT.md` |
| Phase C | Guardian Nudges (parent-first awareness) | `/docs/PHASE_C_GUARDIAN_NUDGES.md` |

Do not implement Phase C features until Phase B exit criteria are met and Phase C is explicitly approved.
