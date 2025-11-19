
import { SwapRoute, Asset, Chain } from '../types';

// Mock Swap Providers
const DEX_PROVIDERS = [
  { name: 'Uniswap V3', icon: '🦄' },
  { name: '1inch', icon: '🛡️' },
  { name: 'Jupiter', icon: '🪐' }, // Solana
  { name: 'PancakeSwap', icon: '🥞' } // BSC
];

// Mock Bridge Providers
const BRIDGE_PROVIDERS = [
  { name: 'Stargate', icon: '🌌' },
  { name: 'Wormhole', icon: '🕳️' },
  { name: 'Synapse', icon: '🟣' },
  { name: 'Hop Protocol', icon: '🐇' }
];

export const swapService = {
  
  /**
   * Generates simulated routes for swapping/bridging assets.
   */
  getRoutes: async (
    fromChain: Chain, 
    toChain: Chain, 
    fromAsset: Asset, 
    toAsset: Asset, 
    amount: number
  ): Promise<SwapRoute[]> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const isCrossChain = fromChain !== toChain;
    const routes: SwapRoute[] = [];
    
    // Calculate base rate (simulated)
    const rate = fromAsset.price / toAsset.price;
    const baseOutput = amount * rate;

    if (!isCrossChain) {
      // --- SAME CHAIN SWAPS (DEX) ---
      
      // 1. Best Return Route
      routes.push({
        id: 'route_dex_1',
        providerName: fromChain === 'Solana' ? 'Jupiter' : 'Uniswap V3',
        providerIcon: fromChain === 'Solana' ? '🪐' : '🦄',
        type: 'DEX',
        inputAmount: amount,
        outputAmount: baseOutput * 0.997, // 0.3% fee impact
        gasFeeUsd: fromChain === 'Solana' ? 0.0005 : 4.50,
        estimatedTimeSeconds: 15,
        steps: [`Approve ${fromAsset.symbol}`, `Swap on ${fromChain === 'Solana' ? 'Jupiter' : 'Uniswap'}`],
        tags: ['Best Return']
      });

      // 2. Fastest/Cheaper Route (Aggregator)
      routes.push({
        id: 'route_dex_2',
        providerName: '1inch Fusion',
        providerIcon: '🛡️',
        type: 'DEX',
        inputAmount: amount,
        outputAmount: baseOutput * 0.992, // Slightly worse rate
        gasFeeUsd: fromChain === 'Solana' ? 0.0005 : 3.20, // Lower gas
        estimatedTimeSeconds: 10,
        steps: [`Sign Permit`, `Swap on 1inch`],
        tags: ['Lowest Gas']
      });

    } else {
      // --- CROSS CHAIN SWAPS (BRIDGE) ---
      
      // 1. Standard Bridge (Stargate/LayerZero)
      routes.push({
        id: 'route_bridge_1',
        providerName: 'Stargate',
        providerIcon: '🌌',
        type: 'BRIDGE',
        inputAmount: amount,
        outputAmount: baseOutput * 0.995,
        gasFeeUsd: 12.50, // High gas for bridge
        estimatedTimeSeconds: 120, // 2 mins
        steps: [`Approve ${fromAsset.symbol}`, `Deposit to Stargate`, `Wait for Finality`, `Receive on ${toChain}`],
        tags: ['Best Return']
      });

      // 2. Fast Bridge (Hop/Synapse)
      routes.push({
        id: 'route_bridge_2',
        providerName: 'Synapse',
        providerIcon: '🟣',
        type: 'BRIDGE',
        inputAmount: amount,
        outputAmount: baseOutput * 0.985, // Higher slippage for speed
        gasFeeUsd: 15.00,
        estimatedTimeSeconds: 45, // Fast
        steps: [`Approve ${fromAsset.symbol}`, `Bridge via Synapse`, `Receive on ${toChain}`],
        tags: ['Fastest']
      });
    }

    return routes;
  },

  /**
   * Simulates the execution of a swap/bridge
   */
  executeSwap: async (route: SwapRoute, updateProgress: (step: string, index: number) => void): Promise<string> => {
     for (let i = 0; i < route.steps.length; i++) {
         updateProgress(route.steps[i], i);
         // Simulate time per step
         const stepTime = route.type === 'BRIDGE' ? 3000 : 1500; 
         await new Promise(resolve => setTimeout(resolve, stepTime));
     }
     return '0x' + Math.random().toString(16).substr(2, 40); // Mock Tx Hash
  }
};
