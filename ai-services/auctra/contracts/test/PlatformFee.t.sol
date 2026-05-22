// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseTest} from "./Base.t.sol";
import {AuctionSettlement} from "../src/AuctionSettlement.sol";

contract PlatformFeeTest is BaseTest {
    function test_feeSplit_onWinnerClaim() public {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);

        uint256 fee = (PRICE * FEE_BPS) / 10_000;
        uint256 sellerBefore = usd.balanceOf(seller);

        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);

        assertEq(usd.balanceOf(seller), sellerBefore + PRICE - fee, "seller cut");
        assertEq(usd.balanceOf(settlement.TREASURY()), fee, "treasury cut");
    }

    function test_feeSplit_onRunnerUpClaim() public {
        vm.warp(endTime + settlement.CLAIM_WINDOW() + 1);
        bytes memory sig = _sign(signerPk, settlement.RUNNER_UP_TAG(), AUCTION_ID, runnerUp, RUNNER_PRICE);

        uint256 fee = (RUNNER_PRICE * FEE_BPS) / 10_000;
        uint256 sellerBefore = usd.balanceOf(seller);

        vm.prank(runnerUp);
        settlement.claimAsRunnerUp(AUCTION_ID, RUNNER_PRICE, sig);

        assertEq(usd.balanceOf(seller), sellerBefore + RUNNER_PRICE - fee, "seller cut");
        assertEq(usd.balanceOf(settlement.TREASURY()), fee, "treasury cut");
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

    function test_zeroFee_noTreasuryTransfer() public {
        vm.prank(owner);
        settlement.setFeeBps(0);

        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        uint256 sellerBefore = usd.balanceOf(seller);

        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);

        assertEq(usd.balanceOf(seller), sellerBefore + PRICE, "seller gets full");
        assertEq(usd.balanceOf(settlement.TREASURY()), 0, "treasury untouched");
    }

    function test_constructor_revertsAboveMaxFee() public {
        vm.expectRevert(AuctionSettlement.FeeTooHigh.selector);
        new AuctionSettlement(owner, trustedForwarder, usd, badge, signer, 1001);
    }
}
