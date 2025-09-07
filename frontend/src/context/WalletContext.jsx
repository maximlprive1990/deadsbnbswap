import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

const WalletContext = createContext();

// BSC Mainnet configuration
const BSC_CONFIG = {
  chainId: '0x38', // 56 in hex
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

// Contract configuration
const CONTRACT_ADDRESS = '0xb2855c8c0b9af305281d7b417cb2158ed8dc676d';
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "MAX_SUPPLY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bnbPriceInDeads",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyDeadsWithBnb",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "deadAmount", "type": "uint256"}],
    "name": "swapDeadsForBnb",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [bnbBalance, setBnbBalance] = useState('0');
  const [deadsBalance, setDeadsBalance] = useState('0');
  const [currentPrice, setCurrentPrice] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await initializeWallet();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      await initializeWallet();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const switchToBSC = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_CONFIG.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add BSC network');
        }
      } else {
        throw switchError;
      }
    }
  };

  const initializeWallet = async () => {
    try {
      setIsLoading(true);
      
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await web3Provider.getNetwork();
      
      // Check if we're on BSC
      if (network.chainId !== 56) {
        await switchToBSC();
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletSigner = web3Provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, walletSigner);

      setProvider(web3Provider);
      setSigner(walletSigner);
      setContract(contractInstance);
      setWalletAddress(accounts[0]);
      setIsConnected(true);

      // Load balances and price
      await loadBalances(accounts[0], web3Provider, contractInstance);
      
      toast.success('Wallet connected to BSC! 💀');
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBalances = async (address, web3Provider, contractInstance) => {
    try {
      // Get BNB balance
      const bnbBal = await web3Provider.getBalance(address);
      setBnbBalance(ethers.utils.formatEther(bnbBal));

      // Get DEADS balance
      const deadsBal = await contractInstance.balanceOf(address);
      setDeadsBalance(ethers.utils.formatEther(deadsBal));

      // Get current price
      const price = await contractInstance.bnbPriceInDeads();
      setCurrentPrice(ethers.utils.formatEther(price));
    } catch (error) {
      console.error('Error loading balances:', error);
      toast.error('Failed to load balances');
    }
  };

  const connectWallet = async () => {
    await initializeWallet();
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setProvider(null);
    setSigner(null);
    setContract(null);
    setBnbBalance('0');
    setDeadsBalance('0');
    setCurrentPrice('0');
    toast.info('Wallet disconnected');
  };

  const buyDeads = async (bnbAmount) => {
    if (!contract || !signer) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      
      const value = ethers.utils.parseEther(bnbAmount);
      
      // First check if the contract has the function and basic validations
      try {
        // Try to call the contract function statically first to check for errors
        await contract.callStatic.buyDeadsWithBnb({ value });
      } catch (staticError) {
        console.error('Static call failed:', staticError);
        
        // Check common issues
        if (staticError.message.includes('insufficient')) {
          toast.error('Insufficient BNB balance or contract liquidity');
          return;
        } else if (staticError.message.includes('paused')) {
          toast.error('Contract is currently paused');
          return;
        } else if (staticError.message.includes('minimum')) {
          toast.error('Amount below minimum purchase requirement');
          return;
        } else {
          toast.error('Transaction would fail. Check contract conditions.');
          return;
        }
      }
      
      // If static call succeeds, proceed with actual transaction
      let gasLimit;
      try {
        const gasEstimate = await contract.estimateGas.buyDeadsWithBnb({ value });
        gasLimit = gasEstimate.mul(150).div(100); // Add 50% buffer for safety
      } catch (gasError) {
        console.error('Gas estimation failed, using default:', gasError);
        gasLimit = ethers.utils.hexlify(300000); // Use default gas limit
      }
      
      const tx = await contract.buyDeadsWithBnb({ 
        value,
        gasLimit
      });
      
      toast.info(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success('DEADS purchased successfully! 💀');
        await loadBalances(walletAddress, provider, contract);
      } else {
        toast.error('Transaction failed');
      }
      
      return receipt;
    } catch (error) {
      console.error('Buy DEADS error:', error);
      
      // Better error messages
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        toast.error('Transaction would fail. Contract may be paused or have insufficient liquidity.');
      } else if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient BNB for transaction + gas fees');
      } else {
        toast.error(`Transaction failed: ${error.reason || error.message}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sellDeads = async (deadsAmount) => {
    if (!contract || !signer) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      
      const amount = ethers.utils.parseEther(deadsAmount);
      
      // First check if the contract has the function and basic validations
      try {
        // Try to call the contract function statically first to check for errors
        await contract.callStatic.swapDeadsForBnb(amount);
      } catch (staticError) {
        console.error('Static call failed:', staticError);
        
        // Check common issues
        if (staticError.message.includes('insufficient')) {
          toast.error('Insufficient DEADS balance or allowance');
          return;
        } else if (staticError.message.includes('allowance')) {
          toast.error('Please approve DEADS spending first');
          return;
        } else if (staticError.message.includes('paused')) {
          toast.error('Contract is currently paused');
          return;
        } else {
          toast.error('Transaction would fail. Check contract conditions.');
          return;
        }
      }
      
      // If static call succeeds, proceed with actual transaction
      let gasLimit;
      try {
        const gasEstimate = await contract.estimateGas.swapDeadsForBnb(amount);
        gasLimit = gasEstimate.mul(150).div(100); // Add 50% buffer for safety
      } catch (gasError) {
        console.error('Gas estimation failed, using default:', gasError);
        gasLimit = ethers.utils.hexlify(400000); // Use default gas limit
      }
      
      const tx = await contract.swapDeadsForBnb(amount, {
        gasLimit
      });
      
      toast.info(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success('DEADS sold successfully! 💀');
        await loadBalances(walletAddress, provider, contract);
      } else {
        toast.error('Transaction failed');
      }
      
      return receipt;
    } catch (error) {
      console.error('Sell DEADS error:', error);
      
      // Better error messages
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        toast.error('Transaction would fail. Contract may be paused or have insufficient liquidity.');
      } else if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient BNB for gas fees');
      } else {
        toast.error(`Transaction failed: ${error.reason || error.message}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (contract && provider && walletAddress) {
      await loadBalances(walletAddress, provider, contract);
    }
  };

  const value = {
    isConnected,
    walletAddress,
    bnbBalance,
    deadsBalance,
    currentPrice,
    isLoading,
    connectWallet,
    disconnectWallet,
    buyDeads,
    sellDeads,
    refreshBalances,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};