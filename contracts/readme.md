# Auctra Contracts

Solidity contracts for the Auctra hybrid auction platform. Bidding happens off-chain; the chain handles only final settlement, payment, and proof-of-win. Target: Base testnet (or any EVM).

## Contracts

- `src/MockUSD.sol` — testnet ERC-20 (6 decimals) with an open faucet. Settlement currency.
- `src/AchievementBadge.sol` — soulbound ERC-721. Minted to the auction winner on settlement. Only `AuctionSettlement` can mint.
- `src/AuctionSettlement.sol` — verifies backend ECDSA signatures, finalizes claims, and mints badges after the backend verifies UGF payment receipts.

## Settlement flow

1. Auction ends off-chain. Backend signs `(WINNER_TAG, chainid, contract, auctionId, winner, price)`.
2. Winner pays through UGF off-chain/app flow; backend verifies the UGF-sponsored Mock USD payment receipts.
3. Winner calls `claim(auctionId, price, signature)` within the 24 h claim window. Contract mints the soulbound badge and marks settled; it does not pull ERC-20 payment.
4. If winner skips the window, backend signs a runner-up payload (`RUNNER_UP_TAG`). Runner-up calls `claimAsRunnerUp(...)`. Same effect.
5. Backend can configure auctions (`configureAuction`) and rotate the signer (`setBackendSigner`); both `onlyOwner`.

## Layout

```
contracts/
├── src/
├── test/
├── script/
├── lib/                 # forge-std, openzeppelin-contracts (forge install --no-git)
├── foundry.toml
├── remappings.txt
└── readme.md
```

## Build & test

```
forge build
forge test -vv
```

## Deploy

```
PRIVATE_KEY=0x...          # deployer
BACKEND_SIGNER=0x...       # backend ECDSA public address
TRUSTED_FORWARDER=0x...    # UGF forwarder (or 0x0 if not used yet)

forge script script/Deploy.s.sol --rpc-url $RPC --broadcast
```

The script deploys MockUSD, AchievementBadge, and AuctionSettlement; wires `badge.minter = settlement`; prints all addresses.
