// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MockUSD} from "../src/MockUSD.sol";
import {AchievementBadge} from "../src/AchievementBadge.sol";
import {AuctionSettlement} from "../src/AuctionSettlement.sol";

/// @notice Deploys MockUSD, AchievementBadge, AuctionSettlement and wires the minter.
/// Env vars:
///   PRIVATE_KEY        - deployer key
///   TRUSTED_FORWARDER  - UGF (or other ERC-2771) forwarder address; pass 0x0 if none yet
///   BACKEND_SIGNER     - public address of the backend ECDSA signer
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address forwarder = vm.envOr("TRUSTED_FORWARDER", address(0));
        address signer = vm.envAddress("BACKEND_SIGNER");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        MockUSD usd = new MockUSD();
        AchievementBadge badge = new AchievementBadge(deployer);
        AuctionSettlement settlement =
            new AuctionSettlement(deployer, forwarder, usd, badge, signer);
        badge.setMinter(address(settlement));

        vm.stopBroadcast();

        console2.log("MockUSD:           ", address(usd));
        console2.log("AchievementBadge:  ", address(badge));
        console2.log("AuctionSettlement: ", address(settlement));
        console2.log("Backend signer:    ", signer);
        console2.log("Trusted forwarder: ", forwarder);
    }
}
