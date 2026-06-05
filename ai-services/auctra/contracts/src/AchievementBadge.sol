// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/// @notice Soulbound ERC-721 minted to auction winners. Only the auction contract can mint.
contract AchievementBadge is ERC721, Ownable {
    using Strings for uint256;

    struct BadgeData {
        uint256 auctionId;
        uint256 finalPrice;
        uint64 wonAt;
    }

    address public minter;
    uint256 public nextTokenId = 1;
    mapping(uint256 => BadgeData) public badges;

    error OnlyMinter();
    error Soulbound();
    error MinterAlreadySet();

    event MinterSet(address indexed minter);
    event BadgeMinted(address indexed to, uint256 indexed tokenId, uint256 indexed auctionId, uint256 finalPrice);

    constructor(address owner_) ERC721("Auctra Achievement", "AUCT-BADGE") Ownable(owner_) {}

    /// @notice One-shot wiring of the auction contract authorized to mint.
    function setMinter(address minter_) external onlyOwner {
        if (minter != address(0)) revert MinterAlreadySet();
        minter = minter_;
        emit MinterSet(minter_);
    }

    function mint(address to, uint256 auctionId, uint256 finalPrice) external returns (uint256 tokenId) {
        if (msg.sender != minter) revert OnlyMinter();
        tokenId = nextTokenId++;
        badges[tokenId] = BadgeData({auctionId: auctionId, finalPrice: finalPrice, wonAt: uint64(block.timestamp)});
        _safeMint(to, tokenId);
        emit BadgeMinted(to, tokenId, auctionId, finalPrice);
    }

    /// @dev Soulbound: block all transfers except mint (from == 0) and burn (to == 0).
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert Soulbound();
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        BadgeData memory b = badges[tokenId];
        string memory json = string.concat(
            '{"name":"Auctra Win #',
            tokenId.toString(),
            '","description":"Proof of auction win on Auctra.","attributes":[',
            '{"trait_type":"Auction","value":"',
            b.auctionId.toString(),
            '"},{"trait_type":"Final Price","value":"',
            b.finalPrice.toString(),
            '"},{"trait_type":"Won At","value":"',
            uint256(b.wonAt).toString(),
            '"}]}'
        );
        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }
}
