
import React, { useState, useEffect } from 'react';
import { Product, User, GeoLocation, ShippingOption, Order } from '../types';
import { marketService, CATEGORIES } from '../services/marketService';
import { authService } from '../services/authService';
import { Search, Star, ArrowLeft, CheckCircle, Truck, ShieldCheck, Loader2, MapPin, Plus, Trash2, DollarSign, Image as ImageIcon, Package, Clock, MoreVertical, User as UserIcon, MessageCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Row, Image } from '../components/native';

interface BayMarketProps {
  user: User;
  onPurchase?: (amount: number, symbol: string, sellerId: string) => void;
  onMessage?: (userId: string) => void;
}

type MarketView = 'home' | 'search' | 'detail' | 'checkout' | 'success' | 'vendor_profile' | 'sell' | 'dashboard';

export const BayMarket: React.FC<BayMarketProps> = ({ user, onPurchase, onMessage }) => {
  const [view, setView] = useState<MarketView>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewedSeller, setViewedSeller] = useState<User | null>(null);
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Dashboard State
  const [dashboardTab, setDashboardTab] = useState<'buying' | 'selling'>('buying');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [mySales, setMySales] = useState<Order[]>([]);
  const [myListings, setMyListings] = useState<Product[]>([]);
  const [shipModal, setShipModal] = useState<string | null>(null); // orderId
  const [trackingInput, setTrackingInput] = useState('');

  // Sell Form State
  const [sellForm, setSellForm] = useState<{
    title: string;
    description: string;
    price: string;
    category: string;
    subcategory: string;
    condition: 'New' | 'Used' | 'Open Box' | 'Refurbished';
    imageUrl: string;
    location: GeoLocation;
    shippingOptions: ShippingOption[];
  }>({
    title: '',
    description: '',
    price: '',
    category: CATEGORIES[0].name,
    subcategory: CATEGORIES[0].subcategories[0],
    condition: 'New',
    imageUrl: '',
    location: { lat: 0, lng: 0, address: '', isLocalPickupAvailable: false },
    shippingOptions: [{ id: 'ship_default', name: 'Standard Shipping', priceUsd: 10, estimatedDays: '3-5 days' }]
  });
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch Products Effect
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      let data: Product[] = [];
      if (view === 'home' || view === 'search') {
        if (searchQuery) {
          data = await marketService.searchProducts(searchQuery);
        } else {
          data = await marketService.getProductsByCategory(selectedCategory);
        }
      }
      setProducts(data);
      setIsLoadingProducts(false);
    };

    loadProducts();
  }, [searchQuery, selectedCategory, view]);

  // Dashboard Effect
  useEffect(() => {
    if (view === 'dashboard') {
       refreshDashboard();
    }
  }, [view]);

  const refreshDashboard = async () => {
     const orders = await marketService.getOrdersByBuyer(user.id);
     setMyOrders(orders);
     
     const sales = await marketService.getOrdersBySeller(user.id);
     setMySales(sales);
     
     const listings = await marketService.getProductsBySeller(user.id);
     setMyListings(listings);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedShipping(product.shippingOptions[0]?.id || '');
    setView('detail');
  };

  const handleVendorClick = async (sellerId: string) => {
    const seller = authService.getUserById(sellerId);
    if (seller) {
        setViewedSeller(seller);
        const vProds = await marketService.getProductsBySeller(sellerId);
        setVendorProducts(vProds);
        setView('vendor_profile');
    }
  };

  const handleBuyNow = () => {
    setView('checkout');
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;
    setIsPurchasing(true);
    
    // 1. Process Market Data
    await marketService.buyProduct(selectedProduct.id, user.id, selectedShipping);
    
    // 2. Process Payment (if callback provided)
    if (onPurchase) {
       const shippingOption = selectedProduct.shippingOptions.find(o => o.id === selectedShipping);
       const total = selectedProduct.price + (shippingOption?.priceUsd || 0);
       onPurchase(total, selectedProduct.currency, selectedProduct.sellerId);
    }
    
    setIsPurchasing(false);
    setView('success');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
        const newProduct: Product = {
            id: 'prod_' + Date.now(), // DB will generate real ID, this is temp
            sellerId: user.id,
            title: sellForm.title,
            description: sellForm.description,
            price: parseFloat(sellForm.price),
            currency: 'USDC',
            images: [sellForm.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'], 
            category: sellForm.category,
            subcategory: sellForm.subcategory,
            condition: sellForm.condition,
            shippingOptions: sellForm.shippingOptions,
            location: sellForm.location,
            reviews: [],
            createdAt: Date.now()
        };
        await marketService.publishProduct(newProduct);
        setView('home');
    } catch (e) {
        console.error(e);
    } finally {
        setIsPublishing(false);
    }
  };

  const handleMarkShipped = async () => {
     if (shipModal) {
         await marketService.markOrderShipped(shipModal, trackingInput || 'TRACK-' + Date.now());
         setShipModal(null);
         setTrackingInput('');
         refreshDashboard();
     }
  };

  // --- Mock Map Component ---
  const LocationPicker = ({ location, onChange }: { location: GeoLocation, onChange: (loc: GeoLocation) => void }) => {
    const [loadingAddr, setLoadingAddr] = useState(false);

    const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const lat = 30 + (y / rect.height) * 20;
        const lng = -120 + (x / rect.width) * 50;
        
        setLoadingAddr(true);
        const address = await marketService.getAddressFromCoords(lat, lng);
        setLoadingAddr(false);
        
        onChange({ ...location, lat, lng, address });
    };

    return (
        <View className="space-y-2">
            <Text className="text-sm font-bold text-slate-400">Item Location</Text>
            <div 
                onClick={handleMapClick}
                className="w-full h-40 bg-slate-800 rounded-xl border border-white/10 relative overflow-hidden cursor-crosshair group"
            >
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f172a_100%)]"></div>
                
                {location.address ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <MapPin className="text-primary drop-shadow-lg" size={32} fill="currentColor" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 group-hover:text-slate-300">
                        Tap map to set location
                    </div>
                )}
            </div>
            {location.address && (
                <Row className="items-center gap-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                   {loadingAddr ? <Loader2 size={14} className="animate-spin text-emerald-400" /> : <MapPin size={14} className="text-emerald-400" />}
                   <Text className="text-sm text-emerald-400">{loadingAddr ? 'Locating...' : location.address}</Text>
                </Row>
            )}
            <Row className="items-center gap-2 mt-2">
                <TouchableOpacity 
                    onPress={() => onChange({...location, isLocalPickupAvailable: !location.isLocalPickupAvailable})}
                    className={`w-5 h-5 rounded border flex items-center justify-center ${location.isLocalPickupAvailable ? 'bg-primary border-primary' : 'bg-white/5 border-white/20'}`}
                >
                    {location.isLocalPickupAvailable && <CheckCircle size={14} className="text-white" />}
                </TouchableOpacity>
                <Text className="text-sm text-slate-300">Enable Local Pickup</Text>
            </Row>
        </View>
    );
  };

  // --- Render Header ---
  const renderHeader = () => (
    <View className="bg-background/95 backdrop-blur-md border-b border-white/5 pb-3 pt-2 sticky top-0 z-20">
      <Row className="items-center gap-2 mb-3 px-4">
        {(view !== 'home') && (
          <TouchableOpacity onPress={() => setView('home')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft size={20} className="text-white" />
          </TouchableOpacity>
        )}
        <View className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <TextInput 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setView('search');
            }}
            placeholder="Search BayMarket..."
            className="w-full bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white"
          />
        </View>
        <TouchableOpacity 
            onPress={() => setView('dashboard')} 
            className="p-2.5 bg-surface border border-white/10 rounded-xl flex-row items-center gap-1"
        >
           <UserIcon size={16} className="text-slate-400" /> 
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={() => setView('sell')} 
            className="px-3 py-2 bg-primary rounded-xl flex-row items-center gap-1"
        >
           <Plus size={14} className="text-white" /> 
           <Text className="text-white text-xs font-bold">Sell</Text>
        </TouchableOpacity>
      </Row>

      {/* Categories (Only on Home/Search) */}
      {(view === 'home' || view === 'search') && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 gap-2">
          <TouchableOpacity 
            onPress={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-full border ${selectedCategory === 'All' ? 'bg-white border-white' : 'bg-transparent border-slate-700'}`}
          >
            <Text className={`text-xs font-bold ${selectedCategory === 'All' ? 'text-black' : 'text-slate-400'}`}>All</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.name}
              onPress={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1 rounded-full border mr-2 ${selectedCategory === cat.name ? 'bg-white border-white' : 'bg-transparent border-slate-700'}`}
            >
              <Text className={`text-xs font-bold ${selectedCategory === cat.name ? 'text-black' : 'text-slate-400'}`}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // --- Views ---

  if (view === 'dashboard') {
     return (
        <View className="flex-1 h-full bg-black pb-20">
           <View className="px-4 pt-4 pb-2 bg-surface/10">
              <Row className="items-center gap-3 mb-6">
                 <TouchableOpacity onPress={() => setView('home')} className="p-2 rounded-full bg-surface/50">
                    <ArrowLeft size={20} className="text-white" />
                 </TouchableOpacity>
                 <Text className="text-2xl font-bold">My Bay</Text>
              </Row>
              
              <Row className="p-1 bg-surface rounded-xl border border-white/5">
                 <TouchableOpacity 
                   onPress={() => setDashboardTab('buying')}
                   className={`flex-1 py-2.5 items-center rounded-lg ${dashboardTab === 'buying' ? 'bg-white/10 shadow-sm' : ''}`}
                 >
                    <Text className={`text-sm font-bold ${dashboardTab === 'buying' ? 'text-white' : 'text-slate-400'}`}>Buying</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   onPress={() => setDashboardTab('selling')}
                   className={`flex-1 py-2.5 items-center rounded-lg ${dashboardTab === 'selling' ? 'bg-white/10 shadow-sm' : ''}`}
                 >
                    <Text className={`text-sm font-bold ${dashboardTab === 'selling' ? 'text-white' : 'text-slate-400'}`}>Selling</Text>
                 </TouchableOpacity>
              </Row>
           </View>

           <ScrollView contentContainerStyle="p-4 space-y-4">
              {dashboardTab === 'buying' ? (
                 <>
                    <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase History</Text>
                    {myOrders.length === 0 && (
                       <View className="items-center py-10 border border-dashed border-white/10 rounded-xl">
                          <Package className="text-slate-600 mb-2" size={32} />
                          <Text className="text-slate-500 text-sm">No purchases yet.</Text>
                       </View>
                    )}
                    {myOrders.map(order => (
                       <Card key={order.id} className="p-4">
                          <Row className="gap-3 items-start">
                             <Image source={order.productImage} className="w-16 h-16 rounded-lg object-cover bg-slate-800" />
                             <View className="flex-1">
                                <Text className="font-bold text-sm mb-1 line-clamp-1">{order.productTitle}</Text>
                                <Text className="text-xs text-primary font-bold mb-2">{order.price} {order.currency}</Text>
                                <Row className="items-center gap-2">
                                   <View className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                      <Text className="text-current">{order.status}</Text>
                                   </View>
                                   <Text className="text-[10px] text-slate-500">{new Date(order.date).toLocaleDateString()}</Text>
                                </Row>
                             </View>
                          </Row>
                          {order.trackingNumber && (
                             <View className="mt-3 pt-3 border-t border-white/5">
                                <Text className="text-[10px] text-slate-400">Tracking: <Text className="text-white font-mono">{order.trackingNumber}</Text></Text>
                             </View>
                          )}
                       </Card>
                    ))}
                 </>
              ) : (
                 <>
                    <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Orders to Ship</Text>
                    {mySales.filter(s => s.status === 'processing').length === 0 && (
                       <View className="p-4 bg-surface/30 rounded-xl">
                          <Text className="text-sm text-slate-500">No pending orders to ship.</Text>
                       </View>
                    )}
                    {mySales.filter(s => s.status === 'processing').map(order => (
                       <Card key={order.id} className="p-4 border-l-4 border-l-yellow-500">
                          <Row className="justify-between items-start mb-2">
                             <View>
                                <Text className="font-bold text-sm">Sold: {order.productTitle}</Text>
                                <Text className="text-xs text-slate-400">Buyer: {order.buyerId}</Text>
                             </View>
                             <Text className="text-sm font-bold text-primary">{order.price} {order.currency}</Text>
                          </Row>
                          <TouchableOpacity 
                             onPress={() => setShipModal(order.id)}
                             className="w-full py-2 bg-primary rounded-lg items-center justify-center mt-2"
                          >
                             <Text className="text-white text-xs font-bold">Mark as Shipped</Text>
                          </TouchableOpacity>
                       </Card>
                    ))}

                    <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4">My Active Listings</Text>
                    <View className="grid grid-cols-2 gap-2">
                       {myListings.map(item => (
                          <Card key={item.id} className="p-2">
                             <Image source={item.images[0]} className="w-full h-24 rounded-lg object-cover mb-2 bg-slate-800" />
                             <Text className="font-bold text-xs line-clamp-1">{item.title}</Text>
                             <Row className="justify-between items-center mt-1">
                                <Text className="text-xs font-bold text-primary">{item.price}</Text>
                                <MoreVertical size={14} className="text-slate-500" />
                             </Row>
                          </Card>
                       ))}
                       <TouchableOpacity 
                          onPress={() => setView('sell')}
                          className="bg-surface/30 border border-dashed border-white/20 rounded-xl flex items-center justify-center h-36"
                       >
                          <Plus size={24} className="text-slate-400 mb-1" />
                          <Text className="text-xs font-bold text-slate-400">List New Item</Text>
                       </TouchableOpacity>
                    </View>
                 </>
              )}
           </ScrollView>

           {/* Ship Modal */}
           {shipModal && (
              <View className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
                 <View className="bg-surface w-full max-w-sm rounded-2xl border border-white/10 p-5">
                    <Text className="text-lg font-bold mb-4">Confirm Shipment</Text>
                    <Text className="text-sm text-slate-400 mb-4">Please provide the tracking number for this order.</Text>
                    
                    <TextInput 
                       value={trackingInput}
                       onChange={(e) => setTrackingInput(e.target.value)}
                       placeholder="Tracking Number (e.g. USPS...)"
                       className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-4"
                    />
                    
                    <Row className="gap-2">
                       <TouchableOpacity onPress={() => setShipModal(null)} className="flex-1 py-3 bg-surface border border-white/10 rounded-xl items-center">
                          <Text className="text-white text-sm font-bold">Cancel</Text>
                       </TouchableOpacity>
                       <TouchableOpacity onPress={handleMarkShipped} className="flex-1 py-3 bg-primary rounded-xl items-center">
                          <Text className="text-white text-sm font-bold">Confirm</Text>
                       </TouchableOpacity>
                    </Row>
                 </View>
              </View>
           )}
        </View>
     );
  }

  if (view === 'sell') {
    return (
        <View className="flex-1 h-full pb-24 bg-black">
            <Row className="items-center gap-4 px-4 py-4 border-b border-white/5 bg-background z-20">
                <TouchableOpacity onPress={() => setView('home')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                    <ArrowLeft size={20} className="text-white" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">List Item</Text>
            </Row>
            
            <ScrollView contentContainerStyle="p-4 space-y-6">
                {/* Basic Info */}
                <View className="space-y-4">
                    <View className="space-y-2">
                        <Text className="text-sm font-bold text-slate-400">Title</Text>
                        <TextInput 
                            value={sellForm.title}
                            onChange={(e) => setSellForm({...sellForm, title: e.target.value})}
                            className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white"
                            placeholder="What are you selling?"
                        />
                    </View>
                    <Row className="gap-4">
                        <View className="flex-1 space-y-2">
                            <Text className="text-sm font-bold text-slate-400">Price (USDC)</Text>
                            <View className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <TextInput 
                                    type="number"
                                    value={sellForm.price}
                                    onChange={(e) => setSellForm({...sellForm, price: e.target.value})}
                                    className="w-full bg-surface border border-white/10 rounded-xl p-3 pl-9 text-white"
                                    placeholder="0.00"
                                />
                            </View>
                        </View>
                        <View className="flex-1 space-y-2">
                            <Text className="text-sm font-bold text-slate-400">Condition</Text>
                            {/* Shim Select */}
                            <select 
                                value={sellForm.condition}
                                onChange={(e) => setSellForm({...sellForm, condition: e.target.value as any})}
                                className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white outline-none"
                            >
                                <option className="text-black">New</option>
                                <option className="text-black">Open Box</option>
                                <option className="text-black">Used</option>
                                <option className="text-black">Refurbished</option>
                            </select>
                        </View>
                    </Row>
                    <View className="space-y-2">
                        <Text className="text-sm font-bold text-slate-400">Description</Text>
                        <textarea 
                            value={sellForm.description}
                            onChange={(e) => setSellForm({...sellForm, description: e.target.value})}
                            className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white h-32 focus:outline-none"
                            placeholder="Describe your item..."
                        />
                    </View>
                    <View className="space-y-2">
                        <Text className="text-sm font-bold text-slate-400">Image URL</Text>
                        <View className="relative">
                            <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <TextInput 
                                value={sellForm.imageUrl}
                                onChange={(e) => setSellForm({...sellForm, imageUrl: e.target.value})}
                                className="w-full bg-surface border border-white/10 rounded-xl p-3 pl-9 text-white"
                                placeholder="https://..."
                            />
                        </View>
                    </View>
                </View>

                {/* Location Setup */}
                <View className="bg-surface/30 border border-white/5 p-4 rounded-2xl">
                     <LocationPicker 
                        location={sellForm.location} 
                        onChange={(loc) => setSellForm({...sellForm, location: loc})} 
                     />
                </View>

                {/* Delivery Setup */}
                <View className="bg-surface/30 border border-white/5 p-4 rounded-2xl space-y-4">
                    <Row className="items-center justify-between">
                         <Text className="text-sm font-bold text-slate-400">Delivery Options</Text>
                         <TouchableOpacity 
                           onPress={() => setSellForm({
                               ...sellForm, 
                               shippingOptions: [...sellForm.shippingOptions, { id: 'ship_'+Date.now(), name: 'Express', priceUsd: 20, estimatedDays: '1-2 days'}]
                           })}
                         >
                             <Text className="text-xs text-primary font-bold underline">+ Add Method</Text>
                         </TouchableOpacity>
                    </Row>
                    
                    {sellForm.shippingOptions.map((option, idx) => (
                        <Row key={option.id} className="items-start gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                            <View className="flex-1 space-y-2">
                                <TextInput 
                                    value={option.name}
                                    onChange={(e) => {
                                        const newOpts = [...sellForm.shippingOptions];
                                        newOpts[idx].name = e.target.value;
                                        setSellForm({...sellForm, shippingOptions: newOpts});
                                    }}
                                    className="w-full bg-transparent border-b border-white/10 text-sm font-bold pb-1"
                                    placeholder="Method Name"
                                />
                                <Row className="gap-2">
                                    <TextInput 
                                        type="number"
                                        value={option.priceUsd}
                                        onChange={(e) => {
                                            const newOpts = [...sellForm.shippingOptions];
                                            newOpts[idx].priceUsd = parseFloat(e.target.value);
                                            setSellForm({...sellForm, shippingOptions: newOpts});
                                        }}
                                        className="w-20 bg-transparent border-b border-white/10 text-xs pb-1"
                                        placeholder="Price ($)"
                                    />
                                    <TextInput 
                                        value={option.estimatedDays}
                                        onChange={(e) => {
                                            const newOpts = [...sellForm.shippingOptions];
                                            newOpts[idx].estimatedDays = e.target.value;
                                            setSellForm({...sellForm, shippingOptions: newOpts});
                                        }}
                                        className="flex-1 bg-transparent border-b border-white/10 text-xs pb-1"
                                        placeholder="Time (e.g. 2-3 days)"
                                    />
                                </Row>
                            </View>
                            {sellForm.shippingOptions.length > 1 && (
                                <TouchableOpacity 
                                    onPress={() => {
                                        const newOpts = sellForm.shippingOptions.filter((_, i) => i !== idx);
                                        setSellForm({...sellForm, shippingOptions: newOpts});
                                    }}
                                >
                                    <Trash2 size={16} className="text-slate-500" />
                                </TouchableOpacity>
                            )}
                        </Row>
                    ))}
                </View>

                <TouchableOpacity 
                    onPress={handlePublish}
                    disabled={isPublishing || !sellForm.title || !sellForm.price}
                    className="w-full bg-primary items-center justify-center py-4 rounded-xl shadow-lg shadow-indigo-500/20"
                >
                    {isPublishing ? <Loader2 className="animate-spin text-white" /> : <Text className="text-white font-bold">Publish Item</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
  }

  if (view === 'vendor_profile' && viewedSeller) {
      // Use the fetched vendorProducts state
      
      return (
          <View className="flex-1 h-full pb-24 bg-black">
             {/* Header Image / Map Bg */}
             <View className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                 {/* Simulated Map Background */}
                 <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                 
                 <TouchableOpacity onPress={() => setView('home')} className="absolute top-4 left-4 p-2 bg-black/40 rounded-full z-10">
                     <ArrowLeft size={20} className="text-white" />
                 </TouchableOpacity>
             </View>

             {/* Vendor Info Card */}
             <View className="px-4 relative -mt-10">
                 <View className="bg-surface border border-white/10 rounded-2xl p-4 shadow-xl">
                     <Row className="items-start justify-between">
                         <Row className="items-center gap-3">
                             <View className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 -mt-8 shadow-lg overflow-hidden">
                                 {viewedSeller.profileImage ? (
                                     <Image source={viewedSeller.profileImage} className="w-full h-full rounded-full object-cover bg-surface" />
                                 ) : (
                                     <View className="w-full h-full rounded-full bg-surface items-center justify-center">
                                         <Text className="font-bold text-2xl">{viewedSeller.name[0]}</Text>
                                     </View>
                                 )}
                             </View>
                             <View className="mt-1">
                                 <Row className="items-center gap-1">
                                     <Text className="font-bold text-lg">{viewedSeller.username}</Text>
                                     <CheckCircle size={16} className="text-emerald-400" />
                                 </Row>
                                 <Row className="items-center gap-1">
                                     <MapPin size={12} className="text-slate-400" />
                                     <Text className="text-xs text-slate-400">Member since {new Date(viewedSeller.joinedDate).getFullYear()}</Text>
                                 </Row>
                             </View>
                         </Row>
                         <View className="items-end">
                             <Row className="items-center gap-1 justify-end">
                                 <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                 <Text className="font-bold text-lg">{viewedSeller.vendorStats?.rating}</Text>
                             </Row>
                             <Text className="text-xs text-slate-400">{viewedSeller.vendorStats?.reviewCount} Reviews</Text>
                         </View>
                     </Row>

                     {/* Badges */}
                     <Row className="gap-2 mt-4">
                         {viewedSeller.vendorStats?.badges.map(badge => (
                             <View key={badge} className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                                 <Text className="text-indigo-400 text-[10px] font-bold">{badge}</Text>
                             </View>
                         ))}
                         <View className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                             <Text className="text-emerald-400 text-[10px] font-bold">{viewedSeller.vendorStats?.totalSales}+ Sales</Text>
                         </View>
                     </Row>
                     
                     {/* Action Buttons */}
                     {onMessage && (
                       <TouchableOpacity 
                          onPress={() => onMessage(viewedSeller.id)}
                          className="mt-4 w-full py-2 bg-surface border border-white/10 rounded-xl flex-row items-center justify-center gap-2"
                       >
                          <MessageCircle size={16} className="text-white" />
                          <Text className="font-bold text-sm text-white">Message Seller</Text>
                       </TouchableOpacity>
                     )}
                 </View>
             </View>

             <ScrollView contentContainerStyle="pb-24">
             {/* Vendor Location Map Block */}
             <View className="px-4 mt-6">
                 <Text className="font-bold text-sm text-slate-400 uppercase mb-2 ml-1">Shipping From</Text>
                 <View className="w-full h-32 bg-slate-800 rounded-xl border border-white/10 relative overflow-hidden items-center justify-center">
                      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                      <View className="flex-col items-center z-10">
                          <MapPin size={32} className="text-primary mb-1" fill="currentColor" />
                          <Text className="text-sm font-bold text-white">
                             {vendorProducts[0]?.location?.address || "United States"}
                          </Text>
                      </View>
                 </View>
             </View>

             {/* Vendor Listings */}
             <View className="px-4 mt-6">
                 <Text className="font-bold text-sm text-slate-400 uppercase mb-2 ml-1">Active Listings ({vendorProducts.length})</Text>
                 <View className="grid grid-cols-2 gap-2">
                     {vendorProducts.map(product => (
                        <Card 
                           key={product.id} 
                           onClick={() => handleProductClick(product)}
                           className="overflow-hidden"
                        >
                           <View className="aspect-square w-full bg-white relative">
                              <Image source={product.images[0]} className="w-full h-full object-cover" />
                           </View>
                           <View className="p-3">
                              <Text className="font-bold text-xs mb-1 h-8">{product.title}</Text>
                              <Text className="font-bold text-primary text-xs">{product.price} {product.currency}</Text>
                           </View>
                        </Card>
                     ))}
                 </View>
             </View>
             </ScrollView>
          </View>
      );
  }

  if (view === 'success') {
    return (
      <View className="h-full items-center justify-center p-6 bg-black">
        <View className="w-20 h-20 bg-emerald-500/20 rounded-full items-center justify-center mb-4">
          <CheckCircle size={48} className="text-emerald-500" />
        </View>
        <Text className="text-2xl font-bold mb-2">Order Confirmed!</Text>
        <Text className="text-slate-400 text-sm mb-8 text-center">
          Your payment of <Text className="text-white font-bold">{selectedProduct?.price} {selectedProduct?.currency}</Text> has been sent to {authService.getUserById(selectedProduct?.sellerId || '')?.username}.
        </Text>
        <TouchableOpacity 
          onPress={() => {
            setSelectedProduct(null);
            setSearchQuery('');
            setView('home');
          }}
          className="bg-primary py-3 px-8 rounded-xl"
        >
          <Text className="text-white font-bold">Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (view === 'checkout') {
    const shippingOption = selectedProduct?.shippingOptions.find(o => o.id === selectedShipping);
    const total = (selectedProduct?.price || 0) + (shippingOption?.priceUsd || 0); 

    return (
      <View className="flex-1 h-full pb-20 bg-black">
        {renderHeader()}
        <ScrollView contentContainerStyle="p-2 space-y-4 mt-2">
           <Text className="text-xl font-bold">Review Order</Text>
           
           {/* Item */}
           <Card className="p-4">
              <Row className="gap-4">
                  <Image source={selectedProduct?.images[0] || ''} className="w-16 h-16 rounded-lg object-cover" />
                  <View>
                    <Text className="font-bold text-sm mb-1">{selectedProduct?.title}</Text>
                    <Text className="text-primary font-bold">{selectedProduct?.price} {selectedProduct?.currency}</Text>
                  </View>
              </Row>
           </Card>

           {/* Shipping */}
           <View className="space-y-2">
              <Text className="font-bold text-sm text-slate-400 uppercase">Delivery Method</Text>
              
              {/* Local Pickup Option if Available */}
              {selectedProduct?.location?.isLocalPickupAvailable && (
                  <TouchableOpacity 
                    onPress={() => setSelectedShipping('local_pickup')}
                    className={`p-3 rounded-xl border flex-row items-center justify-between ${selectedShipping === 'local_pickup' ? 'bg-primary/10 border-primary' : 'bg-surface border-white/10'}`}
                  >
                     <Row className="items-center gap-2">
                         <MapPin size={16} className="text-white" />
                         <View>
                            <Text className="font-bold text-sm">Local Pickup</Text>
                            <Text className="text-xs text-slate-400">{selectedProduct.location?.address}</Text>
                         </View>
                     </Row>
                     <Text className="font-bold text-sm">Free</Text>
                  </TouchableOpacity>
              )}

              {selectedProduct?.shippingOptions.map(opt => (
                 <TouchableOpacity 
                   key={opt.id}
                   onPress={() => setSelectedShipping(opt.id)}
                   className={`p-3 rounded-xl border flex-row items-center justify-between ${selectedShipping === opt.id ? 'bg-primary/10 border-primary' : 'bg-surface border-white/10'}`}
                 >
                    <Row className="items-center gap-2">
                       <Truck size={16} className="text-white" />
                       <View>
                          <Text className="font-bold text-sm">{opt.name}</Text>
                          <Text className="text-xs text-slate-400">{opt.estimatedDays}</Text>
                       </View>
                    </Row>
                    <Text className="font-bold text-sm">
                       {opt.priceUsd === 0 ? 'Free' : `$${opt.priceUsd}`}
                    </Text>
                 </TouchableOpacity>
              ))}
           </View>

           {/* Summary */}
           <View className="bg-surface border border-white/10 rounded-xl p-4 space-y-2">
              <Row className="justify-between">
                 <Text className="text-sm text-slate-400">Item Subtotal</Text>
                 <Text className="text-sm">{selectedProduct?.price} {selectedProduct?.currency}</Text>
              </Row>
              <Row className="justify-between">
                 <Text className="text-sm text-slate-400">Shipping</Text>
                 <Text className="text-sm">{selectedShipping === 'local_pickup' ? '$0' : `$${shippingOption?.priceUsd || 0}`}</Text>
              </Row>
              <View className="border-t border-white/10 pt-2 mt-2">
                 <Row className="justify-between">
                    <Text className="font-bold text-lg">Total</Text>
                    <Text className="font-bold text-lg">{selectedShipping === 'local_pickup' ? selectedProduct?.price : total} {selectedProduct?.currency}</Text>
                 </Row>
              </View>
           </View>

           <Row className="items-center gap-2 justify-center mt-2">
              <ShieldCheck size={14} className="text-slate-500" /> 
              <Text className="text-xs text-slate-500">Protected by Nova Escrow</Text>
           </Row>

           <TouchableOpacity 
             onPress={handleConfirmPurchase}
             disabled={isPurchasing}
             className="w-full bg-emerald-500 items-center justify-center py-4 rounded-xl shadow-lg"
           >
             {isPurchasing ? <Loader2 className="animate-spin text-white" size={20} /> : <Text className="text-white font-bold">Confirm Payment</Text>}
           </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (view === 'detail' && selectedProduct) {
    const seller = authService.getUserById(selectedProduct.sellerId);

    return (
      <View className="flex-1 h-full pb-20 bg-black">
        {renderHeader()}
        
        <ScrollView>
        {/* Product Images */}
        <View className="aspect-square w-full bg-white relative">
           <Image source={selectedProduct.images[0]} className="w-full h-full object-contain" />
           <View className="absolute bottom-4 right-4 bg-black/70 px-2 py-1 rounded-full">
              <Text className="text-white text-xs">1/{selectedProduct.images.length}</Text>
           </View>
        </View>

        <View className="p-4 space-y-6">
           {/* Title & Price */}
           <View>
              <Text className="text-xl font-bold leading-snug">{selectedProduct.title}</Text>
              <Row className="mt-2 items-baseline gap-2">
                 <Text className="text-2xl font-bold text-primary">{selectedProduct.price} {selectedProduct.currency}</Text>
                 <Text className="text-sm text-slate-400">approx ${selectedProduct.price} USD</Text>
              </Row>
              <Row className="mt-2 gap-2">
                 {selectedProduct.shippingOptions[0] && (
                    <Row className="items-center gap-1 px-2 py-1 bg-surface border border-white/10 rounded">
                        <Truck size={12} className="text-slate-300" /> 
                        <Text className="text-xs text-slate-300">{selectedProduct.shippingOptions[0].name}</Text>
                    </Row>
                 )}
                 {selectedProduct.location?.isLocalPickupAvailable && (
                    <Row className="items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                        <MapPin size={12} className="text-emerald-400" /> 
                        <Text className="text-xs text-emerald-400">Pickup Available</Text>
                    </Row>
                 )}
              </Row>
           </View>

           {/* Vendor Profile */}
           <TouchableOpacity 
             onPress={() => handleVendorClick(selectedProduct.sellerId)}
             className="bg-surface/50 border border-white/10 rounded-xl p-4"
           >
              <Row className="items-center justify-between mb-3">
                 <Text className="text-xs font-bold text-slate-500 uppercase">Seller Information</Text>
                 <Text className="text-xs text-primary font-bold">View Profile</Text>
              </Row>
              <Row className="items-center gap-3">
                 <View className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5">
                    {seller?.profileImage ? (
                       <Image source={seller.profileImage} className="w-full h-full rounded-full object-cover" />
                    ) : (
                       <View className="w-full h-full rounded-full bg-slate-800 items-center justify-center">
                          <Text className="font-bold text-lg">{seller?.name[0]}</Text>
                       </View>
                    )}
                 </View>
                 <View className="flex-1">
                    <Row className="items-center gap-1">
                       <Text className="font-bold text-white">{seller?.username}</Text>
                       <CheckCircle size={14} className="text-emerald-400" />
                    </Row>
                    <Row className="items-center gap-2 mt-0.5">
                       <Row className="items-center gap-0.5">
                          <Star size={10} className="fill-yellow-400 text-yellow-400" /> 
                          <Text className="text-xs text-slate-400">{seller?.vendorStats?.rating}</Text>
                       </Row>
                       <Text className="text-xs text-slate-400">•</Text>
                       <Text className="text-xs text-slate-400">{seller?.vendorStats?.totalSales} Sold</Text>
                    </Row>
                 </View>
              </Row>
              
              {/* Description */}
              <View className="mt-4 pt-4 border-t border-white/5">
                 <Text className="font-bold text-sm mb-2">Description</Text>
                 <Text className="text-sm text-slate-300 leading-relaxed">{selectedProduct.description}</Text>
              </View>

              {/* Location Preview */}
              <View className="mt-4 pt-4 border-t border-white/5">
                 <Text className="font-bold text-sm mb-2">Item Location</Text>
                 <Row className="items-center gap-2">
                     <MapPin size={16} className="text-slate-500" />
                     <Text className="text-sm text-slate-300">{selectedProduct.location?.address || 'Location not specified'}</Text>
                 </Row>
              </View>
           </TouchableOpacity>
        </View>
        </ScrollView>

        {/* Sticky Footer */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-white/10">
           <TouchableOpacity 
             onPress={handleBuyNow}
             className="w-full bg-primary items-center justify-center py-3.5 rounded-xl shadow-lg"
           >
              <Text className="text-white font-bold">Buy Now</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Home View ---

  return (
    <View className="flex-1 h-full pb-20 bg-black">
      {renderHeader()}
      
      {/* Content Area */}
      <ScrollView contentContainerStyle="p-2">
        {isLoadingProducts ? (
           <View className="items-center py-20">
               <Loader2 className="animate-spin text-primary" />
           </View>
        ) : (
           <View className="grid grid-cols-2 gap-2 mt-2">
           {products.length === 0 ? (
             <View className="col-span-2 items-center py-10 opacity-50">
                <Search size={32} className="mb-2 text-slate-500" />
                <Text className="text-sm text-slate-500">No items found in {selectedCategory}</Text>
             </View>
           ) : (
             products.map(product => (
               <Card 
                  key={product.id} 
                  onClick={() => handleProductClick(product)}
                  className="overflow-hidden"
               >
                  <View className="aspect-square w-full bg-white relative">
                     <Image source={product.images[0]} className="w-full h-full object-cover" />
                     {product.condition === 'New' && (
                        <View className="absolute top-2 left-2 bg-emerald-500 px-1.5 py-0.5 rounded">
                          <Text className="text-white text-[10px] font-bold">NEW</Text>
                        </View>
                     )}
                  </View>
                  <View className="p-3">
                     <Text className="font-bold text-sm mb-1 h-10" style={{ overflow: 'hidden' }}>{product.title}</Text>
                     <Text className="font-bold text-primary text-sm">{product.price} {product.currency}</Text>
                     <Row className="items-center justify-between mt-2">
                        <Text className="text-[10px] text-slate-400 truncate max-w-[80px]">@{authService.getUserById(product.sellerId)?.username}</Text>
                        <Row className="items-center gap-0.5">
                           <Star size={8} className="fill-yellow-400 text-yellow-400" /> 
                           <Text className="text-[10px] text-slate-400">4.8</Text>
                        </Row>
                     </Row>
                     <Row className="items-center gap-1 mt-1">
                        <MapPin size={8} className="text-slate-500" /> 
                        <Text className="text-[9px] text-slate-500">{product.location?.address.split(',')[0] || 'Remote'}</Text>
                     </Row>
                  </View>
               </Card>
             ))
           )}
           </View>
        )}
      </ScrollView>
    </View>
  );
};
