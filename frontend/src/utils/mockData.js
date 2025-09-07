export const mockData = {
  wallet: {
    address: "0x742d35Cc6643C0532925a3b8E8C7df43c4e7cE4A",
    isConnected: false
  },
  balances: {
    bnb: "2.5463",
    deads: "15847.2341"
  },
  price: {
    bnbToDeads: "12500.0000", // 1 BNB = 12,500 DEADS
    deadsToPrice: "0.00008" // 1 DEADS = 0.00008 BNB
  },
  contract: {
    address: "0xb2855c8c0b9af305281d7b417cb2158ed8dc676d",
    network: "BSC Mainnet",
    chainId: 56
  },
  transactions: [
    {
      id: "1",
      type: "buy",
      amount: "0.1",
      token: "BNB",
      timestamp: new Date().toISOString(),
      status: "completed",
      hash: "0x1234567890abcdef..."
    },
    {
      id: "2", 
      type: "sell",
      amount: "1000",
      token: "DEADS",
      timestamp: new Date().toISOString(),
      status: "completed",
      hash: "0xabcdef1234567890..."
    }
  ]
};