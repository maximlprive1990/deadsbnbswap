// Configuration
const BSC_CONFIG = {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
};

const CONTRACT_ADDRESS = '0xb2855c8c0b9af305281d7b417cb2158ed8dc676d';
const CONTRACT_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function bnbPriceInDeads() view returns (uint256)",
    "function buyDeadsWithBnb() payable",
    "function swapDeadsForBnb(uint256 deadAmount)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

// Prix fixe : 0.0002 BNB pour 5 DEADS
const FIXED_PRICE_BNB = "0.0002";
const FIXED_DEADS_AMOUNT = "5";
// Calcul : 1 BNB = 25,000 DEADS (car 5 DEADS = 0.0002 BNB)
const FIXED_RATE_DISPLAY = "25000"; // 1 BNB = 25,000 DEADS

// Global variables
let provider, signer, contract;
let walletAddress = '';
let isLoading = false;
let statusElement;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    statusElement = document.getElementById('status');
    setupEventListeners();
    checkWalletConnection();
});

function setupEventListeners() {
    const connectBtn = document.getElementById('connectBtn');
    const buyDeadsBtn = document.getElementById('buyBtn');
    const sellDeadsBtn = document.getElementById('sellBtn');
    
    if (connectBtn) connectBtn.addEventListener('click', connectWallet);
    if (buyDeadsBtn) buyDeadsBtn.addEventListener('click', buyDeads);
    if (sellDeadsBtn) sellDeadsBtn.addEventListener('click', sellDeads);
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Input listeners pour la vente uniquement (achat est à prix fixe)
    const deadsAmountInput = document.getElementById('deadsAmount');
    if (deadsAmountInput) {
        deadsAmountInput.addEventListener('input', updateDeadsConversion);
    }

    // Wallet events
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
    }
}

async function checkWalletConnection() {
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
}

async function connectWallet() {
    if (!window.ethereum) {
        updateStatus('MetaMask not installed! Please install MetaMask.', 'error');
        return;
    }

    try {
        setLoading(true);
        await initializeWallet();
    } catch (error) {
        console.error('Connection error:', error);
        updateStatus(`Connection failed: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

async function initializeWallet() {
    try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await web3Provider.getNetwork();

        if (network.chainId !== 56) {
            await switchToBSC();
            return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletSigner = web3Provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, walletSigner);

        provider = web3Provider;
        signer = walletSigner;
        contract = contractInstance;
        walletAddress = accounts[0];

        updateWalletUI();
        await loadBalances();
        
        updateStatus('Wallet connected to BSC! 💀', 'success');
    } catch (error) {
        throw error;
    }
}

async function switchToBSC() {
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
}

function updateWalletUI() {
    const walletDisconnected = document.getElementById('walletDisconnected');
    const walletConnected = document.getElementById('walletConnected');
    const balanceSection = document.getElementById('balanceSection');
    const swapSection = document.getElementById('swapSection');
    const walletAddressEl = document.getElementById('walletAddress');
    
    if (walletDisconnected) walletDisconnected.classList.add('hidden');
    if (walletConnected) walletConnected.classList.remove('hidden');
    if (balanceSection) balanceSection.classList.remove('hidden');
    if (swapSection) swapSection.classList.remove('hidden');
    
    if (walletAddressEl) {
        walletAddressEl.textContent = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }
}

async function loadBalances() {
    try {
        const bnbBal = await provider.getBalance(walletAddress);
        const bnbBalance = ethers.utils.formatEther(bnbBal);

        const deadsBal = await contract.balanceOf(walletAddress);
        const deadsBalance = ethers.utils.formatEther(deadsBal);

        // Utiliser le prix fixe au lieu du prix du contrat
        const currentPrice = FIXED_RATE_DISPLAY; // 1 BNB = 25,000 DEADS

        updateBalanceDisplay('bnbBalance', `${parseFloat(bnbBalance).toFixed(4)} BNB`);
        updateBalanceDisplay('deadsBalance', `${parseFloat(deadsBalance).toFixed(2)} DEADS`);
        updateBalanceDisplay('currentPrice', `1 BNB = ${parseInt(currentPrice).toLocaleString()} DEADS`);
        
        updateBalanceDisplay('bnbBalanceSmall', parseFloat(bnbBalance).toFixed(4));
        updateBalanceDisplay('deadsBalanceSmall', parseFloat(deadsBalance).toFixed(2));

        // Mise à jour de l'affichage du prix fixe
        updateFixedPriceDisplay();

        // Utiliser le prix fixe pour les calculs
        window.currentPriceValue = currentPrice;
        window.bnbBalanceValue = bnbBalance;
        window.deadsBalanceValue = deadsBalance;
    } catch (error) {
        console.error('Error loading balances:', error);
        updateStatus('Failed to load balances', 'error');
    }
}

function updateBalanceDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = value;
}

function updateFixedPriceDisplay() {
    // Mise à jour de l'affichage pour montrer le prix fixe
    const fixedPriceInfo = document.getElementById('fixedPriceInfo');
    if (fixedPriceInfo) {
        fixedPriceInfo.textContent = `Fixed: ${FIXED_PRICE_BNB} BNB = ${FIXED_DEADS_AMOUNT} DEADS`;
    }
    
    // Mise à jour de la conversion dans l'onglet d'achat
    const bnbConversion = document.getElementById('bnbConversion');
    if (bnbConversion) {
        bnbConversion.textContent = `You will receive exactly ${FIXED_DEADS_AMOUNT} DEADS for ${FIXED_PRICE_BNB} BNB (Fixed Rate: 1 BNB = ${parseInt(FIXED_RATE_DISPLAY).toLocaleString()} DEADS)`;
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`${tabName}Tab`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}

function updateDeadsConversion() {
    const deadsAmount = document.getElementById('deadsAmount')?.value;
    if (deadsAmount && window.currentPriceValue) {
        const bnbAmount = (parseFloat(deadsAmount) / parseFloat(window.currentPriceValue)).toFixed(6);
        updateBalanceDisplay('deadsConversion', `≈ ${bnbAmount} BNB`);
    } else {
        updateBalanceDisplay('deadsConversion', '≈ 0 BNB');
    }
}

// Fonction d'achat modifiée avec prix fixe
async function buyDeads() {
    const bnbAmount = FIXED_PRICE_BNB; // Prix fixe : 0.0002 BNB
    
    if (!contract || !signer) {
        updateStatus('Wallet not connected', 'error');
        return;
    }
    
    // Vérifier si l'utilisateur a assez de BNB
    if (parseFloat(bnbAmount) > parseFloat(window.bnbBalanceValue)) {
        updateStatus(`Insufficient BNB balance. You need ${bnbAmount} BNB to buy ${FIXED_DEADS_AMOUNT} DEADS`, 'error');
        return;
    }

    try {
        setLoading(true, 'buy');
        updateStatus("Processing transaction...", 'info');
        
        const value = ethers.utils.parseEther(bnbAmount);
        
        // Test statique d'abord
        try {
            await contract.callStatic.buyDeadsWithBnb({ value });
        } catch (staticError) {
            updateStatus('Transaction would fail. Check contract conditions.', 'error');
            return;
        }
        
        // Estimation du gas
        let gasLimit;
        try {
            const gasEstimate = await contract.estimateGas.buyDeadsWithBnb({ value });
            gasLimit = gasEstimate.mul(150).div(100);
        } catch (gasError) {
            gasLimit = ethers.utils.hexlify(300000);
        }
        
        // Envoi de la transaction
        const tx = await contract.buyDeadsWithBnb({ value, gasLimit });
        
        updateStatus(`Transaction sent! Hash: ${tx.hash}`, 'info');
        
        // Attendre la confirmation
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            updateStatus(`Success! You received ${FIXED_DEADS_AMOUNT} DEADS for ${FIXED_PRICE_BNB} BNB! 💀`, 'success');
            await loadBalances(); // Mettre à jour les balances
        } else {
            updateStatus('Transaction failed', 'error');
        }
        
    } catch (error) {
        console.error('Buy DEADS error:', error);
        
        if (error.code === 'ACTION_REJECTED') {
            updateStatus('Transaction rejected by user', 'error');
        } else if (error.message.includes('insufficient funds')) {
            updateStatus('Insufficient BNB for transaction + gas fees', 'error');
        } else {
            updateStatus(`Error: ${error.reason || error.message}`, 'error');
        }
    } finally {
        setLoading(false, 'buy');
    }
}

async function sellDeads() {
    const deadsAmount = document.getElementById('deadsAmount')?.value;
    
    if (!deadsAmount || parseFloat(deadsAmount) <= 0) {
        updateStatus('Please enter a valid DEADS amount', 'error');
        return;
    }
    
    if (parseFloat(deadsAmount) > parseFloat(window.deadsBalanceValue)) {
        updateStatus('Insufficient DEADS balance', 'error');
        return;
    }

    try {
        setLoading(true, 'sell');
        updateStatus("Processing sell transaction...", 'info');
        
        const amount = ethers.utils.parseEther(deadsAmount);
        
        try {
            await contract.callStatic.swapDeadsForBnb(amount);
        } catch (staticError) {
            updateStatus('Transaction would fail. Check contract conditions.', 'error');
            return;
        }
        
        let gasLimit;
        try {
            const gasEstimate = await contract.estimateGas.swapDeadsForBnb(amount);
            gasLimit = gasEstimate.mul(150).div(100);
        } catch (gasError) {
            gasLimit = ethers.utils.hexlify(400000);
        }
        
        const tx = await contract.swapDeadsForBnb(amount, { gasLimit });
        
        updateStatus(`Transaction sent: ${tx.hash}`, 'info');
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            updateStatus('DEADS sold successfully! 💀', 'success');
            document.getElementById('deadsAmount').value = '';
            await loadBalances();
        } else {
            updateStatus('Transaction failed', 'error');
        }
        
    } catch (error) {
        console.error('Sell DEADS error:', error);
        
        if (error.code === 'ACTION_REJECTED') {
            updateStatus('Transaction rejected by user', 'error');
        } else if (error.message.includes('insufficient funds')) {
            updateStatus('Insufficient BNB for gas fees', 'error');
        } else {
            updateStatus(`Transaction failed: ${error.reason || error.message}`, 'error');
        }
    } finally {
        setLoading(false, 'sell');
    }
}

function setLoading(loading, type = '') {
    isLoading = loading;
    
    if (type === 'buy') {
        const btn = document.getElementById('buyBtn');
        const icon = document.getElementById('buyIcon');
        const text = document.getElementById('buyText');
        
        if (btn) btn.disabled = loading;
        if (loading) {
            if (icon) icon.className = 'fas fa-skull spinner';
            if (text) text.textContent = 'SUMMONING DEADS...';
        } else {
            if (icon) icon.className = 'fas fa-skull';
            if (text) text.textContent = `BUY ${FIXED_DEADS_AMOUNT} DEADS (${FIXED_PRICE_BNB} BNB)`;
        }
    } else if (type === 'sell') {
        const btn = document.getElementById('sellBtn');
        const icon = document.getElementById('sellIcon');
        const text = document.getElementById('sellText');
        
        if (btn) btn.disabled = loading;
        if (loading) {
            if (icon) icon.className = 'fas fa-skull spinner';
            if (text) text.textContent = 'RELEASING SOULS...';
        } else {
            if (icon) icon.className = 'fas fa-arrow-down';
            if (text) text.textContent = 'SELL DEADS';
        }
    } else {
        const connectBtn = document.getElementById('connectBtn');
        if (connectBtn) {
            connectBtn.disabled = loading;
            if (loading) {
                connectBtn.innerHTML = '<div class="spinner">💀</div> Connecting...';
            } else {
                connectBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect MetaMask';
            }
        }
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        window.location.reload();
    } else {
        initializeWallet();
    }
}

function updateStatus(message, type = 'info') {
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
    }
    
    // Aussi afficher comme toast si disponible
    showToast(message, type);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
}

function copyAddress() {
    const address = '0x5E02B3C73a9285aa17E5E3F6D1a3bdF6Ac7ae6E3';
    navigator.clipboard.writeText(address);
    updateStatus('Manual swap address copied! 💀', 'success');
}

function copyContract() {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    updateStatus('Contract address copied!', 'success');
}

function openBscScan() {
    window.open(`https://bscscan.com/address/${CONTRACT_ADDRESS}`, '_blank');
}

// Fonction pour mettre à jour les balances DEADS (appelée après achat)
async function updateDeadsBalance() {
    if (contract && walletAddress) {
        try {
            const deadsBal = await contract.balanceOf(walletAddress);
            const deadsBalance = ethers.utils.formatEther(deadsBal);
            updateBalanceDisplay('deadsBalance', `${parseFloat(deadsBalance).toFixed(2)} DEADS`);
            updateBalanceDisplay('deadsBalanceSmall', parseFloat(deadsBalance).toFixed(2));
            window.deadsBalanceValue = deadsBalance;
        } catch (error) {
            console.error('Error updating DEADS balance:', error);
        }
    }
}