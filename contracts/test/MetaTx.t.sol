// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseTest} from "./Base.t.sol";
import {AuctionSettlement} from "../src/AuctionSettlement.sol";

/// @notice UGF sponsors ETH for the user's own signer in the current SDK path,
///         so the settlement contract intentionally uses msg.sender directly.
contract MetaTxTest is BaseTest {
    function test_DirectSponsoredClaimUsesUserSigner() public {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);

        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);

        assertEq(badge.ownerOf(1), winner);
        assertEq(usd.balanceOf(seller), 0);
        assertEq(usd.balanceOf(settlement.treasury()), 0);
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
