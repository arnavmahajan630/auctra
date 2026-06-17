// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AchievementBadge.sol";
import "../src/AuctionSettlement.sol";

contract DeployScript is Script {
    function run() external {
        // Read environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address backendSigner = vm.envAddress("BACKEND_SIGNER");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AchievementBadge
        AchievementBadge badge = new AchievementBadge(vm.addr(deployerPrivateKey));

        address paymentToken = vm.envAddress("PAYMENT_TOKEN");

        // 2. Deploy AuctionSettlement
        // Fee set to 200 bps (2%)
        AuctionSettlement settlement = new AuctionSettlement(
            vm.addr(deployerPrivateKey), // Owner
            badge,
            backendSigner,
            vm.addr(deployerPrivateKey), // treasury
            200, // 2% platform fee
            paymentToken
        );

        // 3. Authorize the settlement contract to mint soulbound badges upon successful claims
        badge.setMinter(address(settlement));

        vm.stopBroadcast();

        console.log("Deployed AchievementBadge at:", address(badge));
        console.log("Deployed AuctionSettlement at:", address(settlement));
    }
}
