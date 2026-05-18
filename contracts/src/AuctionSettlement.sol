// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {AchievementBadge} from "./AchievementBadge.sol";

/// @notice Settles off-chain auctions on-chain via backend ECDSA signatures.
///         Winner pulls payment; runner-up may claim if winner misses their window.
contract AuctionSettlement is ERC2771Context, Ownable {
    using SafeERC20 for IERC20;

    bytes32 public constant WINNER_TAG = keccak256("AUCTRA_WINNER_V1");
    bytes32 public constant RUNNER_UP_TAG = keccak256("AUCTRA_RUNNER_UP_V1");

    uint64 public constant CLAIM_WINDOW = 24 hours;

    IERC20 public immutable mockUSD;
    AchievementBadge public immutable badge;

    address public backendSigner;

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

    event BackendSignerUpdated(address indexed signer);
    event AuctionConfigured(uint256 indexed auctionId, address indexed seller, uint64 endTime, uint64 claimDeadline);
    event Claimed(uint256 indexed auctionId, address indexed winner, uint256 finalPrice, uint256 badgeId);
    event ClaimedAsRunnerUp(uint256 indexed auctionId, address indexed runnerUp, uint256 finalPrice, uint256 badgeId);
    event AuctionCancelled(uint256 indexed auctionId);

    constructor(address owner_, address trustedForwarder, IERC20 mockUSD_, AchievementBadge badge_, address signer_)
        ERC2771Context(trustedForwarder)
        Ownable(owner_)
    {
        if (signer_ == address(0)) revert ZeroAddress();
        mockUSD = mockUSD_;
        badge = badge_;
        backendSigner = signer_;
        emit BackendSignerUpdated(signer_);
    }

    function setBackendSigner(address signer_) external onlyOwner {
        if (signer_ == address(0)) revert ZeroAddress();
        backendSigner = signer_;
        emit BackendSignerUpdated(signer_);
    }

    /// @notice Register an auction's seller + end time. Called by backend admin after listing approval.
    function configureAuction(uint256 auctionId, address seller, uint64 endTime) external onlyOwner {
        AuctionConfig storage a = auctions[auctionId];
        if (a.exists) revert AlreadyConfigured();
        if (seller == address(0)) revert ZeroAddress();
        uint64 deadline = endTime + CLAIM_WINDOW;
        auctions[auctionId] = AuctionConfig({
            seller: seller,
            endTime: endTime,
            claimDeadline: deadline,
            settled: false,
            cancelled: false,
            exists: true
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

        address claimant = _msgSender();
        _verify(WINNER_TAG, auctionId, claimant, finalPrice, signature);

        a.settled = true;
        mockUSD.safeTransferFrom(claimant, a.seller, finalPrice);
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

        address claimant = _msgSender();
        _verify(RUNNER_UP_TAG, auctionId, claimant, finalPrice, signature);

        a.settled = true;
        mockUSD.safeTransferFrom(claimant, a.seller, finalPrice);
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

    /* ───────── ERC2771 plumbing ───────── */

    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}
