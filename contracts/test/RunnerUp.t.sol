// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseTest} from "./Base.t.sol";
import {AuctionSettlement} from "../src/AuctionSettlement.sol";

contract RunnerUpTest is BaseTest {
    function test_RunnerUpClaimsAfterWinnerSkips() public {
        // Winner ghosts. Warp past the claim window.
        vm.warp(endTime + settlement.CLAIM_WINDOW() + 1);

        bytes memory sig = _sign(signerPk, settlement.RUNNER_UP_TAG(), AUCTION_ID, runnerUp, RUNNER_PRICE);

        uint256 feeAmt = (RUNNER_PRICE * FEE_BPS) / 10_000;
        uint256 sellerAmt = RUNNER_PRICE - feeAmt;

        vm.prank(runnerUp);
        settlement.claimAsRunnerUp(AUCTION_ID, RUNNER_PRICE, sig);

        assertEq(usd.balanceOf(seller), sellerAmt, "seller receives payment minus fee");
        assertEq(usd.balanceOf(settlement.treasury()), feeAmt, "treasury receives platform fee");
        assertEq(badge.ownerOf(1), runnerUp);
    }

    function test_Revert_RunnerUpBeforeWindowExpires() public {
        bytes memory sig = _sign(signerPk, settlement.RUNNER_UP_TAG(), AUCTION_ID, runnerUp, RUNNER_PRICE);
        vm.prank(runnerUp);
        vm.expectRevert(AuctionSettlement.WindowNotExpired.selector);
        settlement.claimAsRunnerUp(AUCTION_ID, RUNNER_PRICE, sig);
    }

    function test_Revert_RunnerUpAfterWinnerAlreadyClaimed() public {
        bytes memory wsig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, wsig);

        vm.warp(endTime + settlement.CLAIM_WINDOW() + 1);
        bytes memory rsig = _sign(signerPk, settlement.RUNNER_UP_TAG(), AUCTION_ID, runnerUp, RUNNER_PRICE);
        vm.prank(runnerUp);
        vm.expectRevert(AuctionSettlement.AlreadySettled.selector);
        settlement.claimAsRunnerUp(AUCTION_ID, RUNNER_PRICE, rsig);
    }

    function test_Revert_WinnerSigCannotClaimAsRunnerUp() public {
        vm.warp(endTime + settlement.CLAIM_WINDOW() + 1);
        // A WINNER_TAG signature should not pass the RUNNER_UP_TAG check.
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, runnerUp, RUNNER_PRICE);
        vm.prank(runnerUp);
        vm.expectRevert(AuctionSettlement.BadSignature.selector);
        settlement.claimAsRunnerUp(AUCTION_ID, RUNNER_PRICE, sig);
    }
}
