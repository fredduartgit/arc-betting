// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Betting is Ownable {
    struct Bet {
        address user;
        uint256 amount;
        bool isUp; // true = UP, false = DOWN
        bool claimed;
    }

    IERC20 public paymentToken;
    IERC20 public rewardToken;
    uint256 public nextBetId;
    uint256 public maxBetAmount; // Max amount allowed per bet (in paymentToken decimals)

    mapping(uint256 => Bet) public bets;
    mapping(uint256 => bool) public betResolved;
    mapping(uint256 => bool) public betWon;
    
    event BetPlaced(uint256 indexed betId, address indexed user, uint256 amount, bool isUp);
    event BetResolved(uint256 indexed betId, bool won);
    event RewardsClaimed(uint256 indexed betId, address indexed user, uint256 amount);
    event MaxBetAmountUpdated(uint256 newAmount);

    constructor(address _paymentToken, address _rewardToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        rewardToken = IERC20(_rewardToken);
        maxBetAmount = 10 * (10**6); // Default limit: 10 USDC (assuming 6 decimals)
    }

    function placeBet(uint256 amount, bool isUp) external {
        require(amount > 0, "Amount must be > 0");
        require(amount <= maxBetAmount, "Amount exceeds maximum bet limit");
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        bets[nextBetId] = Bet(msg.sender, amount, isUp, false);
        emit BetPlaced(nextBetId, msg.sender, amount, isUp);
        nextBetId++;
    }

    function resolveBet(uint256 betId, bool won) external onlyOwner {
        require(!betResolved[betId], "Bet already resolved");
        betResolved[betId] = true;
        betWon[betId] = won;
        emit BetResolved(betId, won);
    }

    function claimReward(uint256 betId) external {
        Bet storage bet = bets[betId];
        require(msg.sender == bet.user, "Not your bet");
        require(betResolved[betId], "Bet not resolved");
        require(betWon[betId], "Bet lost");
        require(!bet.claimed, "Already claimed");

        bet.claimed = true;
        
        // Convert USDC (6 decimals) to ARC (18 decimals) -> multiply by 10^12
        // Then multiply by 2 for the payout
        uint256 reward = bet.amount * 2 * (10**12); 
        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");

        emit RewardsClaimed(betId, msg.sender, reward);
    }

    // Admin can deposit reward tokens
    function depositRewards(uint256 amount) external {
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    // SWAP: Exchange ARC (Our Token) for Official USDC (1:1 for MVP)
    function swapArcForUSDC(uint256 amount) external {
        require(amount >= 10**12, "Min swap 1 ARC (18 decimals)");
        // User sends ARC to this contract (18 decimals)
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "ARC transfer failed");
        // Contract sends USDC back to user (6 decimals) -> divide by 10^12
        uint256 usdcAmount = amount / (10**12);
        require(paymentToken.transfer(msg.sender, usdcAmount), "USDC transfer failed");
    }

    // Set maximum bet amount (only owner)
    function setMaxBetAmount(uint256 _maxAmount) external onlyOwner {
        maxBetAmount = _maxAmount;
        emit MaxBetAmountUpdated(_maxAmount);
    }
}
