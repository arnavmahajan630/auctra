// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseTest} from "./Base.t.sol";
import {AuctionSettlement} from "../src/AuctionSettlement.sol";

contract PlatformFeeTest is BaseTest {
    function test_claimPullsPaymentAtomically() public {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);

        uint256 feeAmt = (PRICE * FEE_BPS) / 10_000;
        uint256 sellerAmt = PRICE - feeAmt;

        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);

        assertEq(usd.balanceOf(seller), sellerAmt, "seller receives price minus platform fee");
        assertEq(usd.balanceOf(settlement.treasury()), feeAmt, "treasury receives platform fee");
        assertEq(usd.balanceOf(winner), PRICE * 10 - PRICE, "winner debited for full price");
    }

    function test_runnerUpClaimPullsPaymentAtomically() public {
        vm.warp(endTime + settlement.CLAIM_WINDOW() + 1);
        bytes memory sig = _sign(signerPk, settlement.RUNNER_UP_TAG(), AUCTION_ID, runnerUp, RUNNER_PRICE);

        uint256 feeAmt = (RUNNER_PRICE * FEE_BPS) / 10_000;
        uint256 sellerAmt = RUNNER_PRICE - feeAmt;

        vm.prank(runnerUp);
        settlement.claimAsRunnerUp(AUCTION_ID, RUNNER_PRICE, sig);

        assertEq(usd.balanceOf(seller), sellerAmt, "seller receives price minus platform fee");
        assertEq(usd.balanceOf(settlement.treasury()), feeAmt, "treasury receives platform fee");
        assertEq(usd.balanceOf(runnerUp), RUNNER_PRICE * 10 - RUNNER_PRICE, "runner-up debited for full price");
    }

    function test_setFeeBps_onlyOwner() public {
        vm.prank(winner);
        vm.expectRevert();
        settlement.setFeeBps(500);
    }

    function test_setFeeBps_revertsAboveMax() public {
        vm.prank(owner);
        vm.expectRevert(AuctionSettlement.FeeTooHigh.selector);
        settlement.setFeeBps(1001);
    }

    function test_setFeeBps_emitsEvent() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(settlement));
        emit AuctionSettlement.FeeBpsUpdated(300);
        settlement.setFeeBps(300);
        assertEq(settlement.feeBps(), 300);
    }

    function test_zeroFee_sellerReceivesFullPrice() public {
        vm.prank(owner);
        settlement.setFeeBps(0);

        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);

        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);

        assertEq(badge.ownerOf(1), winner);
        assertEq(usd.balanceOf(seller), PRICE, "seller receives full price when fee is 0");
        assertEq(usd.balanceOf(settlement.treasury()), 0, "treasury untouched when fee is 0");
    }

    function test_constructor_revertsAboveMaxFee() public {
        vm.expectRevert(AuctionSettlement.FeeTooHigh.selector);
        new AuctionSettlement(owner, badge, signer, owner, 1001, address(usd));
    }

    function test_revert_insufficientAllowance() public {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);

        // Revoke approval
        vm.prank(winner);
        usd.approve(address(settlement), 0);

        vm.prank(winner);
        vm.expectRevert();
        settlement.claim(AUCTION_ID, PRICE, sig);
    }
}
