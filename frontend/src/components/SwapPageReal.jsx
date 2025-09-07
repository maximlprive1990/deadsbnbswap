import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Skull, Wallet, ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "../context/WalletContext";

const SwapPageReal = () => {
  const {
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
  } = useWallet();

  const [bnbAmount, setBnbAmount] = useState("");
  const [deadsAmount, setDeadsAmount] = useState("");

  const handleBuyDeads = async () => {
    if (!bnbAmount || parseFloat(bnbAmount) <= 0) {
      toast.error("Please enter a valid BNB amount");
      return;
    }
    
    if (parseFloat(bnbAmount) > parseFloat(bnbBalance)) {
      toast.error("Insufficient BNB balance");
      return;
    }

    try {
      await buyDeads(bnbAmount);
      setBnbAmount("");
    } catch (error) {
      // Error already handled in context
    }
  };

  const handleSellDeads = async () => {
    if (!deadsAmount || parseFloat(deadsAmount) <= 0) {
      toast.error("Please enter a valid DEADS amount");
      return;
    }
    
    if (parseFloat(deadsAmount) > parseFloat(deadsBalance)) {
      toast.error("Insufficient DEADS balance");
      return;
    }

    try {
      await sellDeads(deadsAmount);
      setDeadsAmount("");
    } catch (error) {
      // Error already handled in context
    }
  };

  const calculateDeadsFromBnb = (bnb) => {
    if (!bnb || !currentPrice || currentPrice === '0') return "0";
    return (parseFloat(bnb) * parseFloat(currentPrice)).toFixed(4);
  };

  const calculateBnbFromDeads = (deads) => {
    if (!deads || !currentPrice || currentPrice === '0') return "0";
    return (parseFloat(deads) / parseFloat(currentPrice)).toFixed(6);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const openBscScan = () => {
    window.open(`https://bscscan.com/address/0xb2855c8c0b9af305281d7b417cb2158ed8dc676d`, '_blank');
  };

  return (
    <div className="min-h-screen bg-skull-dark bg-skull-pattern relative overflow-hidden">
      {/* Skull Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 opacity-95"></div>
      <div className="absolute top-20 left-20 opacity-10">
        <Skull size={200} className="text-bone animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-10">
        <Skull size={150} className="text-bone animate-pulse animation-delay-1000" />
      </div>
      <div className="absolute top-1/2 left-10 opacity-5">
        <Skull size={100} className="text-bone animate-bounce animation-delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Skull size={48} className="text-bone-light mr-4" />
            <h1 className="text-5xl font-bold text-bone bg-gradient-to-r from-bone via-bone-light to-gray-300 bg-clip-text text-transparent">
              DEADS SWAP
            </h1>
            <Skull size={48} className="text-bone-light ml-4" />
          </div>
          <p className="text-gray-400 text-lg">
            Trade DEADS tokens on BSC • Enter the realm of the dead
          </p>
          <Badge variant="secondary" className="mt-2 bg-red-900/30 text-red-300 border-red-700">
            BSC Network • Live
          </Badge>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          {!isConnected ? (
            <Button
              onClick={connectWallet}
              disabled={isLoading}
              className="skull-button bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-bone border-2 border-red-700 shadow-lg shadow-red-900/50 transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              {isLoading ? (
                <div className="animate-spin mr-2">💀</div>
              ) : (
                <Wallet className="mr-2" size={20} />
              )}
              {isLoading ? "Connecting..." : "Connect MetaMask"}
            </Button>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Connected to BSC
                </Badge>
                <Button
                  onClick={refreshBalances}
                  variant="ghost"
                  size="sm"
                  className="text-bone hover:text-red-400"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-bone text-sm font-mono bg-gray-800/50 px-3 py-1 rounded border">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                <Button
                  onClick={() => copyToClipboard(walletAddress)}
                  variant="ghost"
                  size="sm"
                  className="text-bone hover:text-red-400"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Balance Display */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-black/50 border-gray-700 backdrop-blur-sm hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-bone text-sm flex items-center">
                  BNB Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-400">
                  {parseFloat(bnbBalance).toFixed(4)} BNB
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-gray-700 backdrop-blur-sm hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-bone text-sm flex items-center">
                  <Skull size={16} className="mr-2" />
                  DEADS Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-400">
                  {parseFloat(deadsBalance).toFixed(2)} DEADS
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-gray-700 backdrop-blur-sm hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-bone text-sm flex items-center">
                  <TrendingUp size={16} className="mr-2" />
                  Current Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-400">
                  1 BNB = {parseFloat(currentPrice).toLocaleString()} DEADS
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Swap Interface */}
        {isConnected && (
          <Card className="max-w-2xl mx-auto bg-black/70 border-gray-700 backdrop-blur-md shadow-2xl shadow-red-900/20">
            <CardHeader>
              <CardTitle className="text-bone text-center flex items-center justify-center">
                <ArrowUpDown className="mr-2" />
                Swap Interface
              </CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Enter the amounts below to trade • Real BSC transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
                  <TabsTrigger value="buy" className="text-bone data-[state=active]:bg-red-800">
                    Buy DEADS
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="text-bone data-[state=active]:bg-red-800">
                    Sell DEADS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="buy" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-bone text-sm font-medium">
                          BNB Amount
                        </label>
                        <span className="text-xs text-gray-400">
                          Balance: {parseFloat(bnbBalance).toFixed(4)} BNB
                        </span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={bnbAmount}
                        onChange={(e) => setBnbAmount(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-bone placeholder-gray-400 focus:border-red-500 input-skull"
                        step="0.001"
                        max={bnbBalance}
                      />
                      {bnbAmount && (
                        <p className="text-gray-400 text-sm mt-1">
                          ≈ {calculateDeadsFromBnb(bnbAmount)} DEADS
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleBuyDeads}
                      disabled={isLoading || !bnbAmount || parseFloat(bnbAmount) <= 0}
                      className="w-full skull-button-large bg-gradient-to-r from-red-800 via-red-900 to-black hover:from-red-700 hover:via-red-800 hover:to-gray-900 text-bone border-2 border-red-700 shadow-lg shadow-red-900/50 transform hover:scale-102 transition-all duration-300 py-6 text-lg font-bold"
                    >
                      {isLoading ? (
                        <div className="animate-spin mr-2 text-2xl">💀</div>
                      ) : (
                        <Skull className="mr-3" size={24} />
                      )}
                      {isLoading ? "Summoning DEADS..." : "BUY DEADS"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="sell" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-bone text-sm font-medium">
                          DEADS Amount
                        </label>
                        <span className="text-xs text-gray-400">
                          Balance: {parseFloat(deadsBalance).toFixed(2)} DEADS
                        </span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={deadsAmount}
                        onChange={(e) => setDeadsAmount(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-bone placeholder-gray-400 focus:border-red-500 input-skull"
                        step="0.01"
                        max={deadsBalance}
                      />
                      {deadsAmount && (
                        <p className="text-gray-400 text-sm mt-1">
                          ≈ {calculateBnbFromDeads(deadsAmount)} BNB
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleSellDeads}
                      disabled={isLoading || !deadsAmount || parseFloat(deadsAmount) <= 0}
                      className="w-full skull-button-large bg-gradient-to-r from-gray-700 via-gray-800 to-black hover:from-gray-600 hover:via-gray-700 hover:to-gray-900 text-bone border-2 border-gray-600 shadow-lg shadow-gray-900/50 transform hover:scale-102 transition-all duration-300 py-6 text-lg font-bold"
                    >
                      {isLoading ? (
                        <div className="animate-spin mr-2 text-2xl">💀</div>
                      ) : (
                        <TrendingDown className="mr-3" size={24} />
                      )}
                      {isLoading ? "Releasing Souls..." : "SELL DEADS"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <div className="flex items-center justify-center mb-4">
            <Skull size={20} className="mr-2" />
            <span>Powered by the underworld • BSC Network</span>
            <Skull size={20} className="ml-2" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm font-mono">
              Contract: 0xb2855c8c0b9af305281d7b417cb2158ed8dc676d
            </p>
            <Button
              onClick={() => copyToClipboard('0xb2855c8c0b9af305281d7b417cb2158ed8dc676d')}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-400"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              onClick={openBscScan}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-400"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SwapPageReal;