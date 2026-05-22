# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Monorepo for **Auctra**, a decentralized auction platform. Two active workspaces:

- `auctra-web/` — Next.js 16 / React 19 frontend + API routes (buyer/seller/users). Supabase (Postgres + RLS + storage) for off-chain state, Privy for auth, ethers/viem/wagmi for chain reads/writes, Zustand for client store, ioredis + socket.io for realtime, Tailwind v4 + shadcn.
- `contracts/` — Foundry project (Solidity 0.8.24). Three contracts: `MockUSD`, `AchievementBadge` (soulbound), `AuctionSettlement` (orchestrator). See `contracts/CLAUDE.md` for the full architecture, signature scheme, and ERC-2771 details.

`ai-services/`, `infra/`, `packages/` are placeholders (readme-only). `Creds/` holds local creds — do not commit.

## Common commands

Frontend (`auctra-web/`):

```
npm run dev        # next dev
npm run build      # next build
npm run lint       # eslint
npx tsx scripts/deploy.ts   # deploy AuctionSettlement + AchievementBadge to Base Sepolia, writes addresses to .env.local
```

Contracts (`contracts/`): see `contracts/CLAUDE.md`. Key commands:

```
forge build
forge test -vv
forge test --match-test test_<name> -vvv
forge fmt
```

Supabase migrations live in `auctra-web/supabase/migrations/` (numbered `0000N_*.sql`). Apply via Supabase CLI against the project pointed to by `.env.local`.

## Frontend conventions (critical)

**Next.js 16 / React 19 has breaking changes vs. older training data.** Before writing API routes, server components, or `app/` files, consult `node_modules/next/dist/docs/` for current APIs and heed deprecation notices. Do not assume Next 13–15 patterns hold.

Routing: App Router under `src/app/`. API routes under `src/app/api/{buyer,seller,users}/<name>/route.ts`. Auth-protected routes use Privy server-auth; Supabase is reached via `src/server/supabase.ts`.

State: Zustand store at `src/store/useAppStore.ts`. Shared types in `src/types/`. Auth/leaderboard modules in `src/modules/`.

## Cross-cutting architecture

Hybrid on-chain / off-chain auction:

1. **Bidding is fully off-chain** — bids hit `/api/buyer/bid`, persisted in Supabase, fanned out via socket.io.
2. **Settlement is on-chain** — when an auction ends, the backend (owner of `AuctionSettlement`) calls `configureAuction(id, seller, endTime)`. The winner has 24h to call `claim()` with a backend ECDSA signature (`WINNER_TAG`). If they no-show, the runner-up path opens (`RUNNER_UP_TAG`) after `claimDeadline`. `claim-signature` and `confirm-claim` API routes mint these signatures and record the resulting NFT badge tokenId.
3. **Proof of win is a soulbound NFT** — `AchievementBadge` minted by the settlement contract; transfers blocked. `tokenURI` returns on-chain JSON with auctionId/finalPrice/wonAt.

The mutually-exclusive winner/runner-up time windows are the core invariant — don't widen them without updating both the contract and the signing routes.

## Conventions

- Solidity: custom errors (no revert strings); `forge fmt` 120 cols / 4-space tabs / no bracket spacing; keep `foundry.toml` and `remappings.txt` remappings in sync.
- TS: ESLint via `eslint-config-next`. No test runner wired in the web workspace yet.
