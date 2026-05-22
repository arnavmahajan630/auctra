// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {AchievementBadge} from "./AchievementBadge.sol";

/// @notice Finalizes UGF-paid off-chain auctions via backend ECDSA signatures.
///         Payment receipts are verified by the backend before a claim signature is issued.
contract AuctionSettlement is Ownable {
    bytes32 public constant WINNER_TAG = keccak256("AUCTRA_WINNER_V1");
    bytes32 public constant RUNNER_UP_TAG = keccak256("AUCTRA_RUNNER_UP_V1");

    uint64 public constant CLAIM_WINDOW = 24 hours;

    /// @notice Platform treasury address
    address public treasury;

    uint16 public constant MAX_FEE_BPS = 1000; // 10%

    AchievementBadge public immutable badge;

    address public backendSigner;
    uint16 public feeBps;

    struct AuctionConfig {
        address seller;
        uint64 endTime;
        uint64 claimDeadline;
        bool settled;
        bool cancelled;
        bool exists;
    }

    mapping(uint256 => AuctionConfig) public auctions;

    error AlreadyConfigured();
    error UnknownAuction();
    error AlreadySettled();
    error Cancelled();
    error WindowExpired();
    error WindowNotExpired();
    error BadSignature();
    error ZeroAddress();
    error FeeTooHigh();

    event BackendSignerUpdated(address indexed signer);
    event AuctionConfigured(uint256 indexed auctionId, address indexed seller, uint64 endTime, uint64 claimDeadline);
    event Claimed(uint256 indexed auctionId, address indexed winner, uint256 finalPrice, uint256 badgeId);
    event ClaimedAsRunnerUp(uint256 indexed auctionId, address indexed runnerUp, uint256 finalPrice, uint256 badgeId);
    event AuctionCancelled(uint256 indexed auctionId);
    event FeeBpsUpdated(uint16 bps);
    constructor(
        address owner_,
        AchievementBadge badge_,
        address signer_,
        address treasury_,
        uint16 feeBps_
    ) Ownable(owner_) {
        if (signer_ == address(0)) revert ZeroAddress();
        if (feeBps_ > MAX_FEE_BPS) revert FeeTooHigh();
        badge = badge_;
        backendSigner = signer_;
        treasury = treasury_ != address(0) ? treasury_ : owner_;
        feeBps = feeBps_;
        emit BackendSignerUpdated(signer_);
        emit FeeBpsUpdated(feeBps_);
    }

    function setBackendSigner(address signer_) external onlyOwner {
        if (signer_ == address(0)) revert ZeroAddress();
        backendSigner = signer_;
        emit BackendSignerUpdated(signer_);
    }

    function setFeeBps(uint16 bps) external onlyOwner {
        if (bps > MAX_FEE_BPS) revert FeeTooHigh();
        feeBps = bps;
        emit FeeBpsUpdated(bps);
    }

    /// @notice Register an auction's seller + end time. Called by backend admin after listing approval.
    function configureAuction(uint256 auctionId, address seller, uint64 endTime) external onlyOwner {
        AuctionConfig storage a = auctions[auctionId];
        if (a.exists) revert AlreadyConfigured();
        if (seller == address(0)) revert ZeroAddress();
        uint64 deadline = endTime + CLAIM_WINDOW;
        auctions[auctionId] = AuctionConfig({
            seller: seller, endTime: endTime, claimDeadline: deadline, settled: false, cancelled: false, exists: true
        });
        emit AuctionConfigured(auctionId, seller, endTime, deadline);
    }

    function cancelAuction(uint256 auctionId) external onlyOwner {
        AuctionConfig storage a = auctions[auctionId];
        if (!a.exists) revert UnknownAuction();
        if (a.settled) revert AlreadySettled();
        a.cancelled = true;
        emit AuctionCancelled(auctionId);
    }

    /// @notice Winner claims within the window. Caller must be the address backend signed for.
    function claim(uint256 auctionId, uint256 finalPrice, bytes calldata signature) external {
        AuctionConfig storage a = auctions[auctionId];
        if (!a.exists) revert UnknownAuction();
        if (a.cancelled) revert Cancelled();
        if (a.settled) revert AlreadySettled();
        if (block.timestamp > a.claimDeadline) revert WindowExpired();

        address claimant = msg.sender;
        _verify(WINNER_TAG, auctionId, claimant, finalPrice, signature);

        a.settled = true;
        uint256 badgeId = badge.mint(claimant, auctionId, finalPrice);

        emit Claimed(auctionId, claimant, finalPrice, badgeId);
    }

    /// @notice Runner-up claims after the winner's window has expired.
    function claimAsRunnerUp(uint256 auctionId, uint256 finalPrice, bytes calldata signature) external {
        AuctionConfig storage a = auctions[auctionId];
        if (!a.exists) revert UnknownAuction();
        if (a.cancelled) revert Cancelled();
        if (a.settled) revert AlreadySettled();
        if (block.timestamp <= a.claimDeadline) revert WindowNotExpired();

        address claimant = msg.sender;
        _verify(RUNNER_UP_TAG, auctionId, claimant, finalPrice, signature);

        a.settled = true;
        uint256 badgeId = badge.mint(claimant, auctionId, finalPrice);

        emit ClaimedAsRunnerUp(auctionId, claimant, finalPrice, badgeId);
    }

    function digest(bytes32 tag, uint256 auctionId, address claimant, uint256 finalPrice)
        public
        view
        returns (bytes32)
    {
        bytes32 inner = keccak256(abi.encode(tag, block.chainid, address(this), auctionId, claimant, finalPrice));
        return MessageHashUtils.toEthSignedMessageHash(inner);
    }

    function _verify(bytes32 tag, uint256 auctionId, address claimant, uint256 finalPrice, bytes calldata signature)
        internal
        view
    {
        bytes32 hash = digest(tag, auctionId, claimant, finalPrice);
        (address recovered, ECDSA.RecoverError err,) = ECDSA.tryRecover(hash, signature);
        if (err != ECDSA.RecoverError.NoError || recovered != backendSigner) revert BadSignature();
    }

}
