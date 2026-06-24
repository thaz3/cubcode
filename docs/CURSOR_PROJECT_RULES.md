# C.U.B. Code Cursor Project Rules

## Source of Truth
You are building the C.U.B. Code MVP.

The source of truth is:

`/docs/MVP_SCOPE.CONTRACT.md`

Read that file before making implementation decisions.

## MVP Goal
The MVP goal is to prove the first household loop:

**Task → Focus → Proof → Approval → Earned Digital Freedom**

Build only the family household MVP.

## Product Promise
**C.U.B. Code calculates earned digital freedom. Parents control access.**

Do not describe or implement the MVP as a device control app.

The app does not lock phones, block apps, or automatically control devices.

The app supports parenting. The app does not replace parenting.

## Tech Stack
Use:

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS

Build a responsive web application first.

Do not create native mobile app files.

## Do Not Implement
Do not implement:

- Native mobile apps
- Automated phone locking or unlocking
- Apple Screen Time integration
- Google Family Link integration
- Child email/password accounts
- Open child profiles
- Child messaging
- Public social networking
- Live GPS tracking
- Public meetup discovery
- Peer bonus voting
- Organization dashboards
- Self-service host accounts
- Public event creation
- Partner marketplace
- Legacy Vault
- Rust crypto
- Local-first encrypted sync
- Zero-knowledge database claims
- AI recommendations
- Citywide map mechanics
- Advanced analytics
- Complex fraud detection

If a feature is not directly required for the household loop, do not build it.

## MVP User Model

### Parents
Parents have real user accounts.

Parents can:

- Create a family
- Create Cub profiles
- Set household rules
- Set daily phone caps
- Set Weekend Bank limits
- Create or assign tasks
- Approve, reject, or send back submitted tasks
- Manage rewards
- View progress
- Run Council Day

### Cubs
Cubs are parent-managed profiles, not independent public users for MVP.

Do not create child email/password accounts in the first build.

Cubs may later have a limited Cub Mode, but it must remain parent-managed and scoped.

Cubs can eventually:

- View assigned tasks
- Claim tasks
- Log Focus Blocks
- Submit proof or reflection
- View approval status
- View XP
- View Focus Tokens
- View earned phone-time credit
- View rank progress
- Prepare for Council Day

Cubs cannot:

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

Admins can:

- Create starter task templates
- Create summer/community task templates
- View basic system data

Do not build full organization dashboards yet.

## Privacy Principle
**Accountability without exposure.**

Use minimal proof.

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

Rule:

**No task is completed until the responsible adult approves it.**

Approved equals the human decision. Completed equals the system reward processing is finished.

## Ledgers
Use simple ledger tables for anything that behaves like a balance.

Create ledgers for:

- XP
- Focus Tokens
- Phone-time minutes
- Weekend Bank minutes

Do not only store current totals.

Each ledger entry should include:

- Cub ID
- Amount
- Reason
- Source task ID when applicable
- Created by
- Created at
- Note when applicable

## Parent Overrides
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

## Weekly Legacy Task
Include one optional Weekly Legacy Task category.

Weekly Legacy Tasks build:

- Black history awareness
- Family identity
- Cultural memory
- Elder connection
- Neighborhood knowledge
- Community pride

For MVP, Weekly Legacy Tasks are simple task templates selected by the parent or admin.

Do not build:

- Full curriculum engine
- AI lesson generator
- Cultural archive
- Legacy Vault

## Cub Code Live Lite
Include only a simple summer task layer.

Cub Code Live Lite may include:

- Parent-selected outdoor tasks
- Admin-created summer tasks
- Park tasks
- Library tasks
- Walking observation tasks
- Family history tasks
- Creative outdoor tasks
- Community service tasks

Do not build:

- Public meetups
- Live GPS
- Open host posting
- Child-discovered events
- Child-to-child messaging
- Public child profiles

Safety rule:

**Families discover trusted tasks. Children do not discover strangers.**

## Milestone Rule
Build one milestone at a time.

Do not build future milestones until the current milestone passes its exit criteria.

## Milestone 1: Household Setup
Build Milestone 1 only first.

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

## Before Writing Code
Before writing code, propose:

1. Folder structure
2. Prisma schema for the current milestone
3. Page/route plan
4. Auth approach
5. Implementation steps

Do not write code until the plan is approved.

## Cursor Behavior Rules
When unsure, choose the simpler implementation and ask before adding scope.

Do not silently expand scope.

Do not create tables, routes, pages, APIs, or components for excluded features.

Every table, endpoint, and UI route must directly support the first household loop:

**Task → Focus → Proof → Approval → Earned Digital Freedom**

If it does not support that loop, do not build it.

## Build Mantra
No platform.  
No social.  
No GPS.  
No device control.  
No crypto theater.  

Prove the household loop.
