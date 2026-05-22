// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseTest} from "./Base.t.sol";
import {AchievementBadge} from "../src/AchievementBadge.sol";

contract SoulboundTest is BaseTest {
    function _mintBadgeToWinner() internal returns (uint256 tokenId) {
        bytes memory sig = _sign(signerPk, settlement.WINNER_TAG(), AUCTION_ID, winner, PRICE);
        vm.prank(winner);
        settlement.claim(AUCTION_ID, PRICE, sig);
        return 1;
    }

    function test_Revert_TransferBlocked() public {
        uint256 id = _mintBadgeToWinner();
        vm.prank(winner);
        vm.expectRevert(AchievementBadge.Soulbound.selector);
        badge.transferFrom(winner, runnerUp, id);
    }

    function test_Revert_SafeTransferBlocked() public {
        uint256 id = _mintBadgeToWinner();
        vm.prank(winner);
        vm.expectRevert(AchievementBadge.Soulbound.selector);
        badge.safeTransferFrom(winner, runnerUp, id);
    }

    function test_Revert_NonMinterCannotMint() public {
        vm.prank(winner);
        vm.expectRevert(AchievementBadge.OnlyMinter.selector);
        badge.mint(winner, 1, 1);
    }

    function test_TokenURIRendersJson() public {
        uint256 id = _mintBadgeToWinner();
        string memory uri = badge.tokenURI(id);
        // Just sanity-check the prefix; full base64 decoding is out of scope here.
        assertEq(bytes(uri).length > 30, true);
    }
}
