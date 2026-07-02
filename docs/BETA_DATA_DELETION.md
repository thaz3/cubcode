# Beta data deletion (admin only)

Use this when a private beta tester asks to delete their account and all related family data.

The tool deletes **one parent account by email** and everything tied to that family. It does **not** touch other users.

## What gets deleted

Starting from the parent email, the tool finds the `User` row and their owned `Family`, then removes:

| Area | Prisma models |
| --- | --- |
| Account | `User`, `PasswordResetToken` |
| Family setup | `Family`, `GuardianNudgePreferences`, `GuardianNudgeRule` |
| Child profiles | `Cub` |
| Tasks & routines | `TaskTemplate`, `Task`, `FocusBlockLog`, `GuardianNudge` |
| Rewards & store | `RewardStoreItem`, `RewardRedemption`, `RewardRedemptionRequest` |
| XP / tokens / phone time | `XpLedgerEntry`, `FocusTokenLedgerEntry`, `PhoneTimeLedgerEntry`, `WeekendBankLedgerEntry` |
| Challenges & focus deck | `Challenge`, `ChallengeProgressLog`, `TrainingDeck`, `FocusActivityCard`, `FocusDeckStackItem`, `FocusActivityCompletion` |
| Council & calendar | `CouncilDaySession`, `CouncilDayCubEntry`, `CalendarEvent` |

Deletion order: family data first (Prisma cascades handle related rows), then the parent `User`.

## Option A — Local CLI (recommended)

Best for private beta. Run against Neon using the same `DATABASE_URL` as production.

### 1. Set environment

```bash
export DATABASE_URL="postgres://..."   # Neon TCP URL from Vercel / Neon dashboard
```

Or put `DATABASE_URL` in your local `.env` file.

### 2. Preview (dry run — default)

Always run this first. It logs counts and Cub nicknames but deletes nothing.

```bash
npm run admin:delete-family -- --email tester@example.com
```

### 3. Delete after confirming the preview

The `--confirm` value must match `--email` exactly.

```bash
npm run admin:delete-family -- --email tester@example.com --confirm tester@example.com
```

## Option B — Protected admin API (optional)

For cases where you cannot run the CLI locally. Not exposed in the UI.

### 1. Set secret in Vercel

Add an environment variable:

```bash
ADMIN_SECRET=your-long-random-secret
```

Generate a strong random value. Do not commit it.

### 2. Dry run

```bash
curl -X POST "https://your-app.vercel.app/api/admin/delete-family" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@example.com","dryRun":true}'
```

### 3. Delete

`confirmEmail` must match `email`.

```bash
curl -X POST "https://your-app.vercel.app/api/admin/delete-family" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@example.com","confirmEmail":"tester@example.com","dryRun":false}'
```

## Safety checks

- Email is normalized to lowercase before lookup (same as login).
- Only the user with that exact email is deleted.
- Dry run is the default for both CLI and API.
- Deletion requires explicit confirmation (`--confirm` or matching `confirmEmail`).
- Preview output is logged before any delete runs.
- No secrets are hardcoded; `ADMIN_SECRET` and `DATABASE_URL` come from env.

## After deletion

Reply to the tester confirming their beta account and related data were removed. Auth sessions are JWT-based and will stop working once the user row is gone.
