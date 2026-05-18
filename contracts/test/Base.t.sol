// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {MockUSD} from "../src/MockUSD.sol";
import {AchievementBadge} from "../src/AchievementBadge.sol";
import {AuctionSettlement} from "../src/AuctionSettlement.sol";

abstract contract BaseTest is Test {
    MockUSD internal usd;
    AchievementBadge internal badge;
    AuctionSettlement internal settlement;

    address internal owner = makeAddr("owner");
    address internal seller = makeAddr("seller");
    address internal winner;
    uint256 internal winnerPk;
    address internal runnerUp;
    uint256 internal runnerUpPk;
    address internal signer;
    uint256 internal signerPk;

    address internal trustedForwarder = makeAddr("forwarder");

    uint256 internal constant AUCTION_ID = 42;
    uint64 internal endTime;
    uint256 internal constant PRICE = 1_000 * 1e6;
    uint256 internal constant RUNNER_PRICE = 800 * 1e6;

    function setUp() public virtual {
        (winner, winnerPk) = makeAddrAndKey("winner");
        (runnerUp, runnerUpPk) = makeAddrAndKey("runnerUp");
        (signer, signerPk) = makeAddrAndKey("backendSigner");

        endTime = uint64(block.timestamp + 1 hours);

        vm.startPrank(owner);
        usd = new MockUSD();
        badge = new AchievementBadge(owner);
        settlement = new AuctionSettlement(owner, trustedForwarder, usd, badge, signer);
        badge.setMinter(address(settlement));
        settlement.configureAuction(AUCTION_ID, seller, endTime);
        vm.stopPrank();

        // Fund and approve both potential claimants.
        usd.mint(winner, PRICE * 10);
        usd.mint(runnerUp, RUNNER_PRICE * 10);
        vm.prank(winner);
        usd.approve(address(settlement), type(uint256).max);
        vm.prank(runnerUp);
        usd.approve(address(settlement), type(uint256).max);
    }

    function _sign(uint256 pk, bytes32 tag, uint256 auctionId, address claimant, uint256 price)
        internal
        view
        returns (bytes memory)
    {
        bytes32 inner = keccak256(abi.encode(tag, block.chainid, address(settlement), auctionId, claimant, price));
        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(inner);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, ethHash);
        return abi.encodePacked(r, s, v);
    }
}
