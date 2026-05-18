// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseTest} from "./Base.t.sol";
import {AuctionSettlement} from "../src/AuctionSettlement.sol";

contract AuctionSettlementTest is BaseTest {
    function test_HappyPath_WinnerClaims() public {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);

        uint256 sellerBefore = usd.balanceOf(seller);
        uint256 winnerBefore = usd.balanceOf(winner);

        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);

        assertEq(usd.balanceOf(seller), sellerBefore + PRICE, "seller paid");
        assertEq(usd.balanceOf(winner), winnerBefore - PRICE, "winner debited");
        assertEq(badge.ownerOf(1), winner, "badge minted to winner");
        (,,, bool settled,,) = settlement.auctions(AUCTION_ID);
        assertTrue(settled);
    }

    function test_Revert_WrongClaimant() public {
        // Backend signs for `winner` but `runnerUp` tries to claim.
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        vm.prank(runnerUp);
        vm.expectRevert(AuctionSettlement.BadSignature.selector);
        settlement.claim(AUCTION_ID, PRICE, sig);
    }

    function test_Revert_ReplayAfterSettled() public {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);

        vm.prank(winner);
        vm.expectRevert(AuctionSettlement.AlreadySettled.selector);
        settlement.claim(AUCTION_ID, PRICE, sig);
    }

    function test_Revert_DifferentAuctionIdReusedSig() public {
        uint256 otherId = 999;
        vm.prank(owner);
        settlement.configureAuction(otherId, seller, endTime);

        // Signature was bound to AUCTION_ID; using it for otherId must fail.
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        vm.prank(winner);
        vm.expectRevert(AuctionSettlement.BadSignature.selector);
        settlement.claim(otherId, PRICE, sig);
    }

    function test_Revert_UnknownAuction() public {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), 12345, winner, PRICE);
        vm.prank(winner);
        vm.expectRevert(AuctionSettlement.UnknownAuction.selector);
        settlement.claim(12345, PRICE, sig);
    }

    function test_Revert_WindowExpired() public {
        vm.warp(endTime + settlement.CLAIM_WINDOW() + 1);
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        vm.prank(winner);
        vm.expectRevert(AuctionSettlement.WindowExpired.selector);
        settlement.claim(AUCTION_ID, PRICE, sig);
    }

    function test_Revert_Cancelled() public {
        vm.prank(owner);
        settlement.cancelAuction(AUCTION_ID);
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        vm.prank(winner);
        vm.expectRevert(AuctionSettlement.Cancelled.selector);
        settlement.claim(AUCTION_ID, PRICE, sig);
    }

    function test_Revert_BadSigner() public {
        // Some other key tries to sign.
        (, uint256 attackerPk) = makeAddrAndKey("attacker");
        bytes memory sig = _sign(attackerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        vm.prank(winner);
        vm.expectRevert(AuctionSettlement.BadSignature.selector);
        settlement.claim(AUCTION_ID, PRICE, sig);
    }
}
