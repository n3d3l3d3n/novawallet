
import { Product, User } from '../types';

const PRODUCTS_KEY = 'nova_market_products';

// eBay-style Categories
export const CATEGORIES = [
  { 
    name: 'Electronics', 
    subcategories: ['Cell Phones', 'Computers', 'Cameras', 'Video Games', 'Audio'] 
  },
  { 
    name: 'Motors', 
    subcategories: ['Parts & Accessories', 'Cars & Trucks', 'Motorcycles'] 
  },
  { 
    name: 'Fashion', 
    subcategories: ['Men', 'Women', 'Kids', 'Watches', 'Sneakers'] 
  },
  { 
    name: 'Collectibles', 
    subcategories: ['Trading Cards', 'Comics', 'Coins', 'Art', 'NFTs'] 
  },
  { 
    name: 'Home & Garden', 
    subcategories: ['Furniture', 'Kitchen', 'Tools', 'Yard'] 
  },
  { 
    name: 'Sporting Goods', 
    subcategories: ['Outdoor Sports', 'Team Sports', 'Fitness', 'Golf'] 
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    sellerId: 'user_123', // Demo user
    title: 'Apple iPhone 15 Pro Max - 256GB - Natural Titanium',
    description: 'Brand new, sealed in box. Unlocked for all carriers. Includes original accessories. Will ship immediately upon payment confirmation.',
    price: 1100,
    currency: 'USDC',
    images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select?wid=940&hei=1112&fmt=png-alpha&.v=1692875663718'],
    category: 'Electronics',
    subcategory: 'Cell Phones',
    condition: 'New',
    location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY', isLocalPickupAvailable: true },
    shippingOptions: [
      { id: 'ship_1', name: 'Standard Shipping', priceUsd: 15, estimatedDays: '3-5 days' },
      { id: 'ship_2', name: 'Express Overnight', priceUsd: 45, estimatedDays: '1 day' }
    ],
    reviews: [],
    createdAt: Date.now()
  },
  {
    id: 'prod_2',
    sellerId: 'user_vendor_2',
    title: 'Vintage Rolex Submariner 16610',
    description: 'Excellent condition. Box and papers included. Serviced in 2023.',
    price: 8500,
    currency: 'USDC',
    images: ['https://content.rolex.com/dam/2022/upright-bba-with-shadow/m126610ln-0001.png?impolicy=v6-upright&imwidth=270'],
    category: 'Fashion',
    subcategory: 'Watches',
    condition: 'Used',
    location: { lat: 48.8566, lng: 2.3522, address: 'Paris, France', isLocalPickupAvailable: false },
    shippingOptions: [
      { id: 'ship_3', name: 'Insured Priority', priceUsd: 150, estimatedDays: '2-3 days' }
    ],
    reviews: [
      { id: 'rev_1', reviewerId: 'user_123', reviewerName: 'Demo User', rating: 5, comment: 'Trusted seller!', date: '2023-10-01'}
    ],
    createdAt: Date.now() - 100000
  },
  {
    id: 'prod_3',
    sellerId: 'user_vendor_3',
    title: 'PlayStation 5 Disc Edition Console',
    description: 'Like new, barely used. Comes with 2 controllers and Spider-Man 2.',
    price: 450,
    currency: 'USDC',
    images: ['https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$facebook$'],
    category: 'Electronics',
    subcategory: 'Video Games',
    condition: 'Open Box',
    location: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA', isLocalPickupAvailable: true },
    shippingOptions: [
      { id: 'ship_1', name: 'Standard Shipping', priceUsd: 20, estimatedDays: '3-5 days' }
    ],
    reviews: [],
    createdAt: Date.now() - 500000
  },
  {
    id: 'prod_4',
    sellerId: 'user_123',
    title: 'Tesla Model 3 Floor Mats (All Weather)',
    description: 'Full set of heavy duty floor mats. Fits 2021-2024 models.',
    price: 120,
    currency: 'USDC',
    images: ['https://shop.tesla.com/assets/img/shop/accessories/interior/floor-mats/model-3/1448816-00-A_0_2000.jpg'],
    category: 'Motors',
    subcategory: 'Parts & Accessories',
    condition: 'New',
    location: { lat: 51.5074, lng: -0.1278, address: 'London, UK', isLocalPickupAvailable: false },
    shippingOptions: [
      { id: 'ship_1', name: 'Ground Shipping', priceUsd: 0, estimatedDays: '5-7 days' }
    ],
    reviews: [],
    createdAt: Date.now() - 200000
  }
];

export const marketService = {
  init: () => {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(MOCK_PRODUCTS));
    }
  },

  getAllProducts: (): Product[] => {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  },

  getProductsByCategory: (category: string): Product[] => {
    const products = marketService.getAllProducts();
    if (category === 'All') return products;
    return products.filter(p => p.category === category);
  },

  getProductsBySeller: (sellerId: string): Product[] => {
    const products = marketService.getAllProducts();
    return products.filter(p => p.sellerId === sellerId);
  },

  searchProducts: (query: string): Product[] => {
    const products = marketService.getAllProducts();
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  },

  getProductById: (id: string): Product | undefined => {
    return marketService.getAllProducts().find(p => p.id === id);
  },

  publishProduct: async (product: Product): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const products = marketService.getAllProducts();
    products.unshift(product); // Add to top
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  // Purchase simulation
  buyProduct: async (productId: string, buyerId: string, shippingId: string): Promise<boolean> => {
    // In a real app, this would handle crypto transaction on chain
    // Here we simulate network delay and success
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  },

  // Mock Geocoding (Reverse)
  getAddressFromCoords: async (lat: number, lng: number): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return random plausible locations for demo
    const locations = ['New York, NY', 'San Francisco, CA', 'London, UK', 'Berlin, DE', 'Tokyo, JP', 'Paris, FR'];
    return locations[Math.floor(Math.random() * locations.length)];
  }
};

marketService.init();
