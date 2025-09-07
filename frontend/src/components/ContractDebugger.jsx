import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { Bug, Info, AlertTriangle } from 'lucide-react';

const ContractDebugger = () => {
  const { contract, provider, walletAddress } = useWallet();
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkContractStatus = async () => {
    if (!contract || !provider || !walletAddress) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    const info = {
      contractAddress: contract.address,
      walletAddress,
      timestamp: new Date().toISOString(),
    };

    try {
      // Check basic contract info
      info.name = await contract.name().catch(() => 'Unknown');
      info.symbol = await contract.symbol().catch(() => 'Unknown');
      info.decimals = await contract.decimals().catch(() => 18);
      info.totalSupply = ethers.utils.formatEther(await contract.totalSupply().catch(() => '0'));
      
      // Check balances
      const bnbBalance = await provider.getBalance(walletAddress);
      info.bnbBalance = ethers.utils.formatEther(bnbBalance);
      
      const deadsBalance = await contract.balanceOf(walletAddress);
      info.deadsBalance = ethers.utils.formatEther(deadsBalance);
      
      // Check current price
      info.currentPrice = ethers.utils.formatEther(await contract.bnbPriceInDeads().catch(() => '0'));
      
      // Check if contract has BNB
      const contractBnbBalance = await provider.getBalance(contract.address);
      info.contractBnbBalance = ethers.utils.formatEther(contractBnbBalance);
      
      // Try to check max supply
      info.maxSupply = ethers.utils.formatEther(await contract.MAX_SUPPLY().catch(() => '0'));
      
      // Check if we can buy (static call with small amount)
      try {
        const testAmount = ethers.utils.parseEther('0.001'); // 0.001 BNB
        await contract.callStatic.buyDeadsWithBnb({ value: testAmount });
        info.canBuy = true;
      } catch (error) {
        info.canBuy = false;
        info.buyError = error.reason || error.message;
      }
      
      // Check if we can sell (if we have DEADS)
      if (parseFloat(info.deadsBalance) > 0) {
        try {
          const testAmount = ethers.utils.parseEther('1'); // 1 DEADS
          await contract.callStatic.swapDeadsForBnb(testAmount);
          info.canSell = true;
        } catch (error) {
          info.canSell = false;
          info.sellError = error.reason || error.message;
        }
      } else {
        info.canSell = false;
        info.sellError = 'No DEADS balance to test';
      }

      setDebugInfo(info);
      toast.success('Contract status checked');
      
    } catch (error) {
      console.error('Debug error:', error);
      toast.error(`Debug failed: ${error.message}`);
      info.error = error.message;
      setDebugInfo(info);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-bone text-sm flex items-center">
          <Bug className="mr-2" size={16} />
          Contract Debugger
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={checkContractStatus}
          disabled={isLoading}
          size="sm"
          className="mb-4 bg-yellow-600 hover:bg-yellow-700 text-black"
        >
          {isLoading ? 'Checking...' : 'Check Contract Status'}
        </Button>
        
        {debugInfo && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                Name: {debugInfo.name}
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                Symbol: {debugInfo.symbol}
              </Badge>
            </div>
            
            <div className="space-y-1 text-gray-300">
              <p>💰 Your BNB: {parseFloat(debugInfo.bnbBalance).toFixed(4)}</p>
              <p>💀 Your DEADS: {parseFloat(debugInfo.deadsBalance).toFixed(2)}</p>
              <p>📊 Price: 1 BNB = {parseFloat(debugInfo.currentPrice).toLocaleString()} DEADS</p>
              <p>🏦 Contract BNB: {parseFloat(debugInfo.contractBnbBalance).toFixed(4)}</p>
              <p>📈 Total Supply: {parseFloat(debugInfo.totalSupply).toLocaleString()}</p>
              <p>🎯 Max Supply: {parseFloat(debugInfo.maxSupply).toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {debugInfo.canBuy ? (
                  <Badge className="bg-green-600 text-white">✅ Can Buy</Badge>
                ) : (
                  <Badge className="bg-red-600 text-white">❌ Cannot Buy</Badge>
                )}
                {debugInfo.canSell ? (
                  <Badge className="bg-green-600 text-white">✅ Can Sell</Badge>
                ) : (
                  <Badge className="bg-red-600 text-white">❌ Cannot Sell</Badge>
                )}
              </div>
              
              {debugInfo.buyError && (
                <div className="flex items-start gap-2 p-2 bg-red-900/20 border border-red-700 rounded">
                  <AlertTriangle size={14} className="text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-medium">Buy Issue:</p>
                    <p className="text-red-200">{debugInfo.buyError}</p>
                  </div>
                </div>
              )}
              
              {debugInfo.sellError && (
                <div className="flex items-start gap-2 p-2 bg-red-900/20 border border-red-700 rounded">
                  <AlertTriangle size={14} className="text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-medium">Sell Issue:</p>
                    <p className="text-red-200">{debugInfo.sellError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractDebugger;