# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build / Test / Deploy

Foundry project (solc 0.8.24, optimizer 200 runs). Dependencies are vendored in `lib/` (forge-std, openzeppelin-contracts) — install with `forge install --no-git` if missing.

```
forge build
forge test -vv
forge test --match-contract AuctionSettlementTest -vvv
forge test --match-test test_<name> -vvv
forge fmt
```

Deploy (script wires `badge.setMinter(settlement)` in one tx-batch):

```
PRIVATE_KEY=0x... BACKEND_SIGNER=0x... TRUSTED_FORWARDER=0x... \
  forge script script/Deploy.s.sol --rpc-url $RPC --broadcast
```

`TRUSTED_FORWARDER` may be `0x0` if ERC-2771 meta-tx not wired yet.

## Architecture

Hybrid auction: bidding lives off-chain; chain handles only **settlement + proof-of-win**. Three contracts coordinate:

- **`MockUSD`** — 6-decimal ERC-20, open faucet. Settlement currency on testnet.
- **`AchievementBadge`** — soulbound ERC-721 (transfers blocked in `_update`; mint/burn allowed). `setMinter` is one-shot and gates `mint()` to the settlement contract only. `tokenURI` returns on-chain base64-encoded JSON with auctionId / finalPrice / wonAt.
- **`AuctionSettlement`** — the orchestrator. Owner (= backend admin) calls `configureAuction(id, seller, endTime)` which also fixes `claimDeadline = endTime + 24h`. The backend verifies UGF payment receipts first; the contract then verifies backend ECDSA signatures, marks settlement final, and mints the badge.

### Signature scheme

Backend signs `keccak256(abi.encode(TAG, chainid, address(this), auctionId, claimant, finalPrice))` wrapped with `MessageHashUtils.toEthSignedMessageHash` (EIP-191, not EIP-712). Two domain tags:

- `WINNER_TAG = keccak256("AUCTRA_WINNER_V1")` — used by `claim()`, valid only while `block.timestamp <= claimDeadline`.
- `RUNNER_UP_TAG = keccak256("AUCTRA_RUNNER_UP_V1")` — used by `claimAsRunnerUp()`, valid only **after** `claimDeadline`.

The mutually-exclusive time windows are the core invariant: winner has 24h; if they no-show, the runner-up path opens. Both set `settled = true` so only one settlement per auction is possible. `claimant` is taken from `_msgSender()` (ERC2771-aware), so signatures bind to the actual caller, not a parameter.

### ERC-2771 meta-tx

`AuctionSettlement` inherits `ERC2771Context` with a `trustedForwarder` set at construction. All three `_msgSender`/`_msgData`/`_contextSuffixLength` overrides resolve to the ERC2771 variants. When generating signatures off-chain, the `claimant` must be the **real** user, not the forwarder.

### Test layout

`test/Base.t.sol` is an abstract `BaseTest` that deploys all three contracts, configures auction id 42, funds winner + runner-up with MockUSD, and exposes `_sign(pk, tag, auctionId, claimant, price)` to produce backend-style signatures. Per-area suites inherit from it: `AuctionSettlement.t.sol`, `RunnerUp.t.sol`, `Soulbound.t.sol`, `MetaTx.t.sol`.

## Conventions

- Custom errors (no revert strings).
- `forge fmt` config: 120 cols, 4-space tabs, no bracket spacing.
- Remappings live in both `foundry.toml` and `remappings.txt` — keep in sync.
