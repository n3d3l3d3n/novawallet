


import { Asset, NFT, StakingOption, StakingPosition } from '../types';

const API_URL = 'https://api.coingecko.com/api/v3';
const CACHE_KEY = 'nova_crypto_cache';
const CACHE_DURATION = 60 * 1000; // 1 minute cache to respect free API limits

interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: { price: number[] };
  image: string;
}

// Local storage key for user minted NFTs
const MINTED_NFTS_KEY = 'nova_minted_nfts';

export const cryptoService = {
  
  // Fetch top coins with market data
  getMarketData: async (count: number = 20): Promise<Asset[]> => {
    // 1. Check Cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('Returning cached crypto data');
        return data;
      }
    }

    // 2. Fetch from API
    try {
      console.log('Fetching fresh crypto data...');
      const response = await fetch(
        `${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${count}&page=1&sparkline=true`
      );

      if (!response.ok) {
          if (response.status === 429) throw new Error('Rate Limit');
          throw new Error('API Error');
      }

      const rawData: CoinGeckoCoin[] = await response.json();

      // 3. Transform Data with Mock Networks
      const assets: Asset[] = rawData.map((coin) => {
        // Simple downsample of sparkline data for performance (take every 4th point)
        const chartData = coin.sparkline_in_7d.price
          .filter((_, i) => i % 4 === 0)
          .map(val => ({ value: val }));

        // Assign a color based on change (Visual styling helper)
        const color = coin.price_change_percentage_24h >= 0 
            ? 'bg-emerald-500' 
            : 'bg-red-500';

        // Assign realistic networks
        let network = 'Ethereum';
        let tokenType = 'ERC20';
        let availableNetworks: string[] = ['Ethereum'];

        const s = coin.symbol.toUpperCase();
        if (s === 'BTC') { network = 'Bitcoin'; tokenType = 'Native'; availableNetworks = ['Bitcoin', 'Lightning']; }
        else if (s === 'ETH') { network = 'Ethereum'; tokenType = 'Native'; availableNetworks = ['Ethereum', 'Arbitrum', 'Optimism', 'Base']; }
        else if (s === 'SOL') { network = 'Solana'; tokenType = 'Native'; availableNetworks = ['Solana']; }
        else if (s === 'USDC' || s === 'USDT') { 
            network = 'Ethereum'; 
            tokenType = 'ERC20'; 
            availableNetworks = ['Ethereum', 'Solana', 'Tron', 'Polygon', 'BSC', 'Avalanche']; 
        }
        else if (s === 'MATIC') { network = 'Polygon'; tokenType = 'Native'; availableNetworks = ['Polygon', 'Ethereum']; }
        else if (s === 'BNB') { network = 'BSC'; tokenType = 'Native'; availableNetworks = ['BSC']; }
        else if (s === 'ADA') { network = 'Cardano'; tokenType = 'Native'; }
        else if (s === 'DOGE') { network = 'Dogecoin'; tokenType = 'Native'; }
        else if (s === 'XRP') { network = 'XRPL'; tokenType = 'Native'; }
        else if (s === 'TRX') { network = 'Tron'; tokenType = 'Native'; }
        else if (s === 'LTC') { network = 'Litecoin'; tokenType = 'Native'; }

        return {
          id: coin.id,
          symbol: s,
          name: coin.name,
          balance: 0, // Balance is user-specific, merged in App.tsx
          price: coin.current_price,
          change24h: parseFloat(coin.price_change_percentage_24h.toFixed(2)),
          color: color,
          chartData: chartData,
          network,
          tokenType,
          availableNetworks
        };
      });

      // 4. Update Cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: assets
      }));

      return assets;

    } catch (error) {
      console.error("CryptoService Error:", error);
      // Fallback to cache if API fails, even if expired
      if (cached) {
         return JSON.parse(cached).data;
      }
      // Fallback to empty if nothing exists
      return [];
    }
  },

  // Helper to simulate a portfolio value based on real prices
  calculatePortfolio: (assets: Asset[], holdings: Record<string, number>) => {
    return assets.reduce((total, asset) => {
      const amount = holdings[asset.symbol] || 0;
      return total + (amount * asset.price);
    }, 0);
  },

  // Mock NFT Data
  getUserNFTs: async (): Promise<NFT[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const minted = JSON.parse(localStorage.getItem(MINTED_NFTS_KEY) || '[]');
    
    const defaults = [
      {
        id: 'nft_1',
        collectionName: 'Bored Ape Yacht Club',
        tokenId: '#8520',
        name: 'BAYC #8520',
        imageUrl: 'https://img.seadn.io/files/8bb757e1e87365739eb7a8619e511938.png?auto=format&dpr=1&w=1000',
        floorPrice: 24.5,
        currency: 'ETH',
        chain: 'ETH',
        description: 'The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs— unique digital collectibles living on the Ethereum blockchain.',
        traits: [
          { type: 'Background', value: 'Purple', rarity: 12 },
          { type: 'Eyes', value: 'Laser Eyes', rarity: 0.9 },
          { type: 'Fur', value: 'Robot', rarity: 2.4 },
          { type: 'Mouth', value: 'Bored Cigarette', rarity: 4.1 }
        ]
      },
      {
        id: 'nft_2',
        collectionName: 'Azuki',
        tokenId: '#4291',
        name: 'Azuki #4291',
        imageUrl: 'https://img.seadn.io/files/c91c1293303eb81311a00664163a4996.png?auto=format&dpr=1&w=1000',
        floorPrice: 4.2,
        currency: 'ETH',
        chain: 'ETH',
        description: 'Azuki starts with a collection of 10,000 avatars that give you membership access to The Garden.',
        traits: [
          { type: 'Type', value: 'Human', rarity: 88 },
          { type: 'Hair', value: 'Silver', rarity: 3.2 },
          { type: 'Clothing', value: 'Kimono', rarity: 5.5 }
        ]
      },
      {
        id: 'nft_3',
        collectionName: 'Mad Lads',
        tokenId: '#942',
        name: 'Mad Lad #942',
        imageUrl: 'https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https://creator-hub-prod.s3.us-east-2.amazonaws.com/mad_lads_pfp_1681872000245.png',
        floorPrice: 145,
        currency: 'SOL',
        chain: 'SOL',
        description: 'Mad Lads is a collection of 10,000 unique PFP NFTs on the Solana blockchain.',
        traits: [
          { type: 'Background', value: 'Sky', rarity: 15 },
          { type: 'Outfit', value: 'Hoodie', rarity: 8.2 },
        ]
      }
    ];

    return [...minted, ...defaults];
  },
  
  // Mint new NFT
  mintNFT: async (nftData: Partial<NFT>): Promise<NFT> => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newNFT: NFT = {
          id: 'mint_' + Date.now(),
          collectionName: nftData.collectionName || 'Nova Creator Collection',
          tokenId: '#' + Math.floor(Math.random() * 10000),
          name: nftData.name || 'Untitled NFT',
          imageUrl: nftData.imageUrl || '',
          floorPrice: 0,
          currency: nftData.chain === 'SOL' ? 'SOL' : 'ETH',
          chain: (nftData.chain as any) || 'ETH',
          description: nftData.description || '',
          traits: nftData.traits || []
      };
      
      const current = JSON.parse(localStorage.getItem(MINTED_NFTS_KEY) || '[]');
      current.unshift(newNFT);
      localStorage.setItem(MINTED_NFTS_KEY, JSON.stringify(current));
      
      return newNFT;
  },

  // Staking Data Mock
  getStakingOptions: async (): Promise<StakingOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
       { id: 'stake_1', assetSymbol: 'SOL', name: 'Solana Validator', apy: 7.5, minStake: 1, lockPeriodDays: 5, riskLevel: 'Low' },
       { id: 'stake_2', assetSymbol: 'ETH', name: 'Lido Staked ETH', apy: 3.8, minStake: 0.1, lockPeriodDays: 0, riskLevel: 'Low' },
       { id: 'stake_3', assetSymbol: 'USDC', name: 'Compound Lending', apy: 4.2, minStake: 50, lockPeriodDays: 0, riskLevel: 'Low' },
       { id: 'stake_4', assetSymbol: 'DOT', name: 'Polkadot Nominator', apy: 14.5, minStake: 10, lockPeriodDays: 28, riskLevel: 'Medium' },
       { id: 'stake_5', assetSymbol: 'ATOM', name: 'Cosmos Hub', apy: 18.2, minStake: 5, lockPeriodDays: 21, riskLevel: 'Medium' },
       { id: 'stake_6', assetSymbol: 'DOGE', name: 'Doge Yield Farm', apy: 45.0, minStake: 1000, lockPeriodDays: 7, riskLevel: 'High' },
    ];
  },

  getUserStakes: async (): Promise<StakingPosition[]> => {
     await new Promise(resolve => setTimeout(resolve, 300));
     return [
        { id: 'pos_1', optionId: 'stake_1', amount: 45, rewardsEarned: 1.24, startDate: Date.now() - 1000000000 },
        { id: 'pos_2', optionId: 'stake_3', amount: 1500, rewardsEarned: 12.50, startDate: Date.now() - 5000000000 }
     ];
  }
};