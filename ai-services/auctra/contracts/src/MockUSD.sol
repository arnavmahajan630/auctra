// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Testnet stand-in for USDC. Open faucet, 6 decimals.
contract MockUSD is ERC20 {
    uint8 private constant DECIMALS = 6;
    uint256 public constant FAUCET_AMOUNT = 10_000 * 10 ** DECIMALS;

    constructor() ERC20("Mock USD", "mUSD") {}

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /// @notice Public faucet: anyone can mint themselves a fixed amount once per call.
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Test helper: arbitrary mint. Kept open for hackathon/testnet only.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
