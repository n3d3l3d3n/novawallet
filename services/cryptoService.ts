
import { Asset, NFT } from '../types';

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

      // 3. Transform Data
      const assets: Asset[] = rawData.map((coin) => {
        // Simple downsample of sparkline data for performance (take every 4th point)
        const chartData = coin.sparkline_in_7d.price
          .filter((_, i) => i % 4 === 0)
          .map(val => ({ value: val }));

        // Assign a color based on change (Visual styling helper)
        const color = coin.price_change_percentage_24h >= 0 
            ? 'bg-emerald-500' 
            : 'bg-red-500';

        return {
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          balance: 0, // Balance is user-specific, merged in App.tsx
          price: coin.current_price,
          change24h: parseFloat(coin.price_change_percentage_24h.toFixed(2)),
          color: color,
          chartData: chartData
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
    
    return [
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
  }
};
