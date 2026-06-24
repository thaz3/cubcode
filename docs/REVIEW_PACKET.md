# C.U.B. Code MVP Review Packet

## Project Summary

C.U.B. Code is a mobile-first family web app that turns real-world tasks, focus blocks, proof/reflection, and parent approval into earned digital freedom.

Core loop:

Task → Focus → Proof → Approval → Earned Digital Freedom

The app calculates earned phone time, XP, Focus Tokens, rewards, and progress. Parents still manually control actual device access.

## Current Stage

The basic MVP functionality is complete. The current focus is reviewing the product architecture, usability, layout hierarchy, and mobile-first UI before adding more features.

## Tech Stack

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Tailwind / React components

## Important Scope Rules

Do not recommend adding:

- Automated device control
- GPS
- Messaging
- Public child profiles
- Child-to-child social features
- Organization dashboards
- AI recommendations
- Crypto / zero-knowledge features
- Full mobile native app
- Marketplace features

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