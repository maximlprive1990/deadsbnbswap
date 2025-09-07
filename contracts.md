# DEADS ↔ BNB Swap - Contracts & Integration Plan

## Contract Details
- **Address**: `0xb2855c8c0b9af305281d7b417cb2158ed8dc676d`
- **Network**: BSC Mainnet (Chain ID: 56)
- **ABI**: Provided (ERC20 + Swap functions)

## Key Contract Functions
1. `buyDeadsWithBnb()` - payable function to buy DEADS with BNB
2. `swapDeadsForBnb(uint256 deadAmount)` - sell DEADS for BNB
3. `balanceOf(address)` - get DEADS token balance
4. `bnbPriceInDeads()` - get current exchange rate

## Frontend Implementation Changes
### Replace Mock Data With:
1. **Real Wallet Connection**:
   - MetaMask integration with ethers.js
   - BSC network detection/switching
   - Real wallet address display

2. **Real Balances**:
   - Fetch actual BNB balance from wallet
   - Fetch actual DEADS balance from contract
   - Real-time price from contract

3. **Real Transactions**:
   - Actual blockchain transactions
   - Transaction hash display
   - Transaction status tracking
   - Gas estimation

## Web3 Integration Components
1. **WalletContext** - React context for wallet state
2. **ContractService** - Service for contract interactions
3. **Web3Utils** - Utility functions for blockchain operations

## Backend Requirements
- No backend needed for direct contract interaction
- All operations happen on-chain via MetaMask

## Security Considerations
- Input validation for amounts
- Proper error handling for failed transactions
- Network verification (BSC only)
- Sufficient balance checks before transactions