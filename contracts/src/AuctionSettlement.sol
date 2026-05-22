// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {AchievementBadge} from "./AchievementBadge.sol";

/// @notice Settles auctions atomically: pulls ERC-20 payment from winner, distributes to seller
///         and treasury, then mints the soulbound achievement badge — all in a single transaction.
contract AuctionSettlement is Ownable {
    bytes32 public constant WINNER_TAG = keccak256("AUCTRA_WINNER_V1");
    bytes32 public constant RUNNER_UP_TAG = keccak256("AUCTRA_RUNNER_UP_V1");

    uint64 public constant CLAIM_WINDOW = 24 hours;

    /// @notice ERC-20 token used for auction payments (seller cut + platform fee).
    IERC20 public immutable paymentToken;

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
    error PaymentFailed();

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
        uint16 feeBps_,
        address paymentToken_
    ) Ownable(owner_) {
        if (signer_ == address(0)) revert ZeroAddress();
        if (paymentToken_ == address(0)) revert ZeroAddress();
        if (feeBps_ > MAX_FEE_BPS) revert FeeTooHigh();
        badge = badge_;
        backendSigner = signer_;
        treasury = treasury_ != address(0) ? treasury_ : owner_;
        feeBps = feeBps_;
        paymentToken = IERC20(paymentToken_);
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

    /// @notice Winner claims within the window. Caller must approve this contract for `finalPrice`
    ///         payment tokens before calling. Atomically pays seller + treasury and mints badge.
    function claim(uint256 auctionId, uint256 finalPrice, bytes calldata signature) external {
        AuctionConfig storage a = auctions[auctionId];
        if (!a.exists) revert UnknownAuction();
        if (a.cancelled) revert Cancelled();
        if (a.settled) revert AlreadySettled();
        if (block.timestamp > a.claimDeadline) revert WindowExpired();

        address claimant = msg.sender;
        _verify(WINNER_TAG, auctionId, claimant, finalPrice, signature);

        a.settled = true;
        _settlePayment(claimant, a.seller, finalPrice);
        uint256 badgeId = badge.mint(claimant, auctionId, finalPrice);

        emit Claimed(auctionId, claimant, finalPrice, badgeId);
    }

    /// @notice Runner-up claims after the winner's window has expired. Same approve requirement as claim().
    function claimAsRunnerUp(uint256 auctionId, uint256 finalPrice, bytes calldata signature) external {
        AuctionConfig storage a = auctions[auctionId];
        if (!a.exists) revert UnknownAuction();
        if (a.cancelled) revert Cancelled();
        if (a.settled) revert AlreadySettled();
        if (block.timestamp <= a.claimDeadline) revert WindowNotExpired();

        address claimant = msg.sender;
        _verify(RUNNER_UP_TAG, auctionId, claimant, finalPrice, signature);

        a.settled = true;
        _settlePayment(claimant, a.seller, finalPrice);
        uint256 badgeId = badge.mint(claimant, auctionId, finalPrice);

        emit ClaimedAsRunnerUp(auctionId, claimant, finalPrice, badgeId);
    }

    /// @dev Pulls `finalPrice` tokens from `claimant`, routes fee to treasury and remainder to seller.
    function _settlePayment(address claimant, address seller, uint256 finalPrice) internal {
        uint256 feeAmt = (finalPrice * feeBps) / 10_000;
        uint256 sellerAmt = finalPrice - feeAmt;
        if (!paymentToken.transferFrom(claimant, seller, sellerAmt)) revert PaymentFailed();
        if (feeAmt > 0) {
            if (!paymentToken.transferFrom(claimant, treasury, feeAmt)) revert PaymentFailed();
        }
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
