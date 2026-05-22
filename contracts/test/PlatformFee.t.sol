// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseTest} from "./Base.t.sol";
import {AuctionSettlement} from "../src/AuctionSettlement.sol";

contract PlatformFeeTest is BaseTest {
    function test_claimDoesNotPullPaymentAfterUgfSettlement() public {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);

        uint256 sellerBefore = usd.balanceOf(seller);
        uint256 winnerBefore = usd.balanceOf(winner);

        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);

        assertEq(usd.balanceOf(seller), sellerBefore, "seller paid before mint through UGF");
        assertEq(usd.balanceOf(winner), winnerBefore, "winner not debited by mint");
        assertEq(usd.balanceOf(settlement.treasury()), 0, "treasury paid before mint through UGF");
    }

    function test_runnerUpClaimDoesNotPullPaymentAfterUgfSettlement() public {
        vm.warp(endTime + settlement.CLAIM_WINDOW() + 1);
        bytes memory sig = _sign(signerPk, settlement.RUNNER_UP_TAG(), AUCTION_ID, runnerUp, RUNNER_PRICE);

        uint256 sellerBefore = usd.balanceOf(seller);
        uint256 runnerBefore = usd.balanceOf(runnerUp);

        vm.prank(runnerUp);
        settlement.claimAsRunnerUp(AUCTION_ID, RUNNER_PRICE, sig);

        assertEq(usd.balanceOf(seller), sellerBefore, "seller paid before mint through UGF");
        assertEq(usd.balanceOf(runnerUp), runnerBefore, "runner-up not debited by mint");
        assertEq(usd.balanceOf(settlement.treasury()), 0, "treasury paid before mint through UGF");
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

    function test_zeroFee_stillMintsWithoutTokenTransfer() public {
        vm.prank(owner);
        settlement.setFeeBps(0);

        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);

        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);

        assertEq(badge.ownerOf(1), winner);
        assertEq(usd.balanceOf(settlement.treasury()), 0, "treasury untouched");
    }

    function test_constructor_revertsAboveMaxFee() public {
        vm.expectRevert(AuctionSettlement.FeeTooHigh.selector);
        new AuctionSettlement(owner, badge, signer, owner, 1001);
    }
}
