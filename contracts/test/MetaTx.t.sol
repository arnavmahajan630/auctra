// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseTest} from "./Base.t.sol";
import {AuctionSettlement} from "../src/AuctionSettlement.sol";

/// @notice ERC-2771 sanity: when the trusted forwarder calls the contract with the
///         original user appended as the trailing 20 bytes, `_msgSender()` resolves
///         to that user — so the winner's signed payload is honored.
contract MetaTxTest is BaseTest {
    function test_ForwarderRelayedClaimResolvesUserAsSender() public {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        bytes memory data = abi.encodeCall(AuctionSettlement.claim, (AUCTION_ID, PRICE, sig));

        // Forwarder appends the original user address as the suffix.
        vm.prank(trustedForwarder);
        (bool ok,) = address(settlement).call(abi.encodePacked(data, winner));
        assertTrue(ok, "forwarded claim should succeed");

        assertEq(badge.ownerOf(1), winner);
        uint256 fee = (PRICE * FEE_BPS) / 10_000;
        assertEq(usd.balanceOf(seller), PRICE - fee);
        assertEq(usd.balanceOf(settlement.TREASURY()), fee);
    }

    function test_NonForwarderRelayDoesNotSpoofSender() public {
        // If a random EOA tries the same trick (appending the winner's address),
        // _msgSender() falls back to the actual caller — not winner — so signature check fails.
        address notForwarder = makeAddr("notForwarder");
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        bytes memory data = abi.encodeCall(AuctionSettlement.claim, (AUCTION_ID, PRICE, sig));

        vm.prank(notForwarder);
        (bool ok, bytes memory ret) = address(settlement).call(abi.encodePacked(data, winner));
        assertFalse(ok, "non-forwarder spoof must revert");
        // revert reason = BadSignature selector
        bytes4 sel;
        assembly {
            sel := mload(add(ret, 0x20))
        }
        assertEq(sel, AuctionSettlement.BadSignature.selector);
    }
}
