
import React, { useState, useEffect } from 'react';
import { Product, User, GeoLocation, ShippingOption } from '../types';
import { marketService, CATEGORIES } from '../services/marketService';
import { authService } from '../services/authService';
import { Search, ShoppingCart, Star, ArrowLeft, CheckCircle, Truck, ShieldCheck, User as UserIcon, Loader2, MapPin, Plus, Trash2, Package, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface BayMarketProps {
  user: User;
}

type MarketView = 'home' | 'search' | 'detail' | 'checkout' | 'success' | 'vendor_profile' | 'sell';

export const BayMarket: React.FC<BayMarketProps> = ({ user }) => {
  const [view, setView] = useState<MarketView>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewedSeller, setViewedSeller] = useState<User | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [isPurchasing, setIsPurchasing] = useState(false);

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

  useEffect(() => {
    if (view === 'home' || view === 'search') {
      if (searchQuery) {
        setProducts(marketService.searchProducts(searchQuery));
      } else {
        setProducts(marketService.getProductsByCategory(selectedCategory));
      }
    }
  }, [searchQuery, selectedCategory, view]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedShipping(product.shippingOptions[0]?.id || '');
    setView('detail');
  };

  const handleVendorClick = (sellerId: string) => {
    const seller = authService.getUserById(sellerId);
    if (seller) {
        setViewedSeller(seller);
        setView('vendor_profile');
    }
  };

  const handleBuyNow = () => {
    setView('checkout');
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;
    setIsPurchasing(true);
    await marketService.buyProduct(selectedProduct.id, user.id, selectedShipping);
    setIsPurchasing(false);
    setView('success');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
        const newProduct: Product = {
            id: 'prod_' + Date.now(),
            sellerId: user.id,
            title: sellForm.title,
            description: sellForm.description,
            price: parseFloat(sellForm.price),
            currency: 'USDC',
            images: [sellForm.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'], // Fallback
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
        // Reset form
    } catch (e) {
        console.error(e);
    } finally {
        setIsPublishing(false);
    }
  };

  // --- Mock Map Component for Location Selection ---
  const LocationPicker = ({ location, onChange }: { location: GeoLocation, onChange: (loc: GeoLocation) => void }) => {
    const [loadingAddr, setLoadingAddr] = useState(false);

    const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        // Mock coordinate generation based on click
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Pseudo random coords for demo visual
        const lat = 30 + (y / rect.height) * 20;
        const lng = -120 + (x / rect.width) * 50;
        
        setLoadingAddr(true);
        const address = await marketService.getAddressFromCoords(lat, lng);
        setLoadingAddr(false);
        
        onChange({ ...location, lat, lng, address });
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400">Item Location</label>
            <div 
                onClick={handleMapClick}
                className="w-full h-40 bg-slate-800 rounded-xl border border-white/10 relative overflow-hidden cursor-crosshair group"
            >
                {/* Mock Map Grid */}
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
                <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                   {loadingAddr ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                   {loadingAddr ? 'Locating...' : location.address}
                </div>
            )}
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={location.isLocalPickupAvailable}
                    onChange={(e) => onChange({...location, isLocalPickupAvailable: e.target.checked})}
                    className="rounded border-white/20 bg-white/5"
                />
                <span className="text-sm text-slate-300">Enable Local Pickup</span>
            </label>
        </div>
    );
  };

  // --- Render Header ---
  const renderHeader = () => (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-white/5 pb-3 pt-2">
      <div className="flex items-center gap-2 mb-3">
        {(view !== 'home') && (
          <button onClick={() => setView('home')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setView('search');
            }}
            placeholder="Search BayMarket..."
            className="w-full bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button 
            onClick={() => setView('sell')} 
            className="px-3 py-2 bg-primary hover:bg-indigo-500 rounded-xl text-white text-xs font-bold flex items-center gap-1 transition-colors"
        >
           <Plus size={14} /> Sell
        </button>
      </div>

      {/* Categories (Only on Home/Search) */}
      {(view === 'home' || view === 'search') && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${selectedCategory === 'All' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-400 border-slate-700'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${selectedCategory === cat.name ? 'bg-white text-black border-white' : 'bg-transparent text-slate-400 border-slate-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // --- Views ---

  if (view === 'sell') {
    return (
        <div className="pb-24 animate-in slide-in-from-bottom">
            <div className="flex items-center gap-4 px-4 py-4 border-b border-white/5 sticky top-0 bg-background z-20">
                <button onClick={() => setView('home')} className="p-2 -ml-2 rounded-full hover:bg-white/10"><ArrowLeft size={20} /></button>
                <h1 className="text-xl font-bold">List Item</h1>
            </div>
            
            <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Title</label>
                        <input 
                            type="text" 
                            value={sellForm.title}
                            onChange={(e) => setSellForm({...sellForm, title: e.target.value})}
                            className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary/50"
                            placeholder="What are you selling?"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">Price (USDC)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="number" 
                                    value={sellForm.price}
                                    onChange={(e) => setSellForm({...sellForm, price: e.target.value})}
                                    className="w-full bg-surface border border-white/10 rounded-xl p-3 pl-9 text-white focus:ring-2 focus:ring-primary/50"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400">Condition</label>
                            <select 
                                value={sellForm.condition}
                                onChange={(e) => setSellForm({...sellForm, condition: e.target.value as any})}
                                className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary/50"
                            >
                                <option>New</option>
                                <option>Open Box</option>
                                <option>Used</option>
                                <option>Refurbished</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Description</label>
                        <textarea 
                            value={sellForm.description}
                            onChange={(e) => setSellForm({...sellForm, description: e.target.value})}
                            className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary/50 h-32"
                            placeholder="Describe your item..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400">Image URL</label>
                        <div className="relative">
                            <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="text" 
                                value={sellForm.imageUrl}
                                onChange={(e) => setSellForm({...sellForm, imageUrl: e.target.value})}
                                className="w-full bg-surface border border-white/10 rounded-xl p-3 pl-9 text-white focus:ring-2 focus:ring-primary/50"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Location Setup */}
                <div className="bg-surface/30 border border-white/5 p-4 rounded-2xl">
                     <LocationPicker 
                        location={sellForm.location} 
                        onChange={(loc) => setSellForm({...sellForm, location: loc})} 
                     />
                </div>

                {/* Delivery Setup */}
                <div className="bg-surface/30 border border-white/5 p-4 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                         <h3 className="text-sm font-bold text-slate-400">Delivery Options</h3>
                         <button 
                           onClick={() => setSellForm({
                               ...sellForm, 
                               shippingOptions: [...sellForm.shippingOptions, { id: 'ship_'+Date.now(), name: 'Express', priceUsd: 20, estimatedDays: '1-2 days'}]
                           })}
                           className="text-xs text-primary font-bold hover:underline"
                         >
                             + Add Method
                         </button>
                    </div>
                    
                    {sellForm.shippingOptions.map((option, idx) => (
                        <div key={option.id} className="flex items-start gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                            <div className="flex-1 space-y-2">
                                <input 
                                    type="text" 
                                    value={option.name}
                                    onChange={(e) => {
                                        const newOpts = [...sellForm.shippingOptions];
                                        newOpts[idx].name = e.target.value;
                                        setSellForm({...sellForm, shippingOptions: newOpts});
                                    }}
                                    className="w-full bg-transparent border-b border-white/10 text-sm font-bold pb-1 focus:border-primary outline-none"
                                    placeholder="Method Name"
                                />
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={option.priceUsd}
                                        onChange={(e) => {
                                            const newOpts = [...sellForm.shippingOptions];
                                            newOpts[idx].priceUsd = parseFloat(e.target.value);
                                            setSellForm({...sellForm, shippingOptions: newOpts});
                                        }}
                                        className="w-20 bg-transparent border-b border-white/10 text-xs pb-1 focus:border-primary outline-none"
                                        placeholder="Price ($)"
                                    />
                                    <input 
                                        type="text" 
                                        value={option.estimatedDays}
                                        onChange={(e) => {
                                            const newOpts = [...sellForm.shippingOptions];
                                            newOpts[idx].estimatedDays = e.target.value;
                                            setSellForm({...sellForm, shippingOptions: newOpts});
                                        }}
                                        className="flex-1 bg-transparent border-b border-white/10 text-xs pb-1 focus:border-primary outline-none"
                                        placeholder="Time (e.g. 2-3 days)"
                                    />
                                </div>
                            </div>
                            {sellForm.shippingOptions.length > 1 && (
                                <button 
                                    onClick={() => {
                                        const newOpts = sellForm.shippingOptions.filter((_, i) => i !== idx);
                                        setSellForm({...sellForm, shippingOptions: newOpts});
                                    }}
                                    className="text-slate-500 hover:text-red-400"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button 
                    onClick={handlePublish}
                    disabled={isPublishing || !sellForm.title || !sellForm.price}
                    className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                    {isPublishing ? <Loader2 className="animate-spin" /> : 'Publish Item'}
                </button>
            </div>
        </div>
    );
  }

  if (view === 'vendor_profile' && viewedSeller) {
      const vendorProducts = marketService.getProductsBySeller(viewedSeller.id);
      
      return (
          <div className="pb-24 animate-in slide-in-from-right">
             {/* Header Image / Map Bg */}
             <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                 {/* Simulated Map Background */}
                 <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                 
                 <button onClick={() => setView('home')} className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 z-10">
                     <ArrowLeft size={20} />
                 </button>
             </div>

             {/* Vendor Info Card */}
             <div className="px-4 relative -mt-10">
                 <div className="bg-surface border border-white/10 rounded-2xl p-4 shadow-xl">
                     <div className="flex items-start justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 -mt-8 shadow-lg">
                                 {viewedSeller.profileImage ? (
                                     <img src={viewedSeller.profileImage} className="w-full h-full rounded-full object-cover bg-surface" />
                                 ) : (
                                     <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-2xl">
                                         {viewedSeller.name[0]}
                                     </div>
                                 )}
                             </div>
                             <div className="mt-1">
                                 <h2 className="font-bold text-lg flex items-center gap-1">
                                     {viewedSeller.username}
                                     <CheckCircle size={16} className="text-emerald-400" />
                                 </h2>
                                 <div className="flex items-center gap-1 text-xs text-slate-400">
                                     <MapPin size={12} />
                                     <span>Member since {new Date(viewedSeller.joinedDate).getFullYear()}</span>
                                 </div>
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="flex items-center gap-1 font-bold text-lg justify-end">
                                 <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                 {viewedSeller.vendorStats?.rating}
                             </div>
                             <div className="text-xs text-slate-400">{viewedSeller.vendorStats?.reviewCount} Reviews</div>
                         </div>
                     </div>

                     {/* Badges */}
                     <div className="flex gap-2 mt-4">
                         {viewedSeller.vendorStats?.badges.map(badge => (
                             <span key={badge} className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                                 {badge}
                             </span>
                         ))}
                         <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                             {viewedSeller.vendorStats?.totalSales}+ Sales
                         </span>
                     </div>
                 </div>
             </div>

             {/* Vendor Location Map Block */}
             <div className="px-4 mt-6">
                 <h3 className="font-bold text-sm text-slate-400 uppercase mb-2 ml-1">Shipping From</h3>
                 <div className="w-full h-32 bg-slate-800 rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                      <div className="flex flex-col items-center text-slate-400 z-10">
                          <MapPin size={32} className="text-primary mb-1" fill="currentColor" />
                          <span className="text-sm font-bold text-white">
                             {vendorProducts[0]?.location?.address || "United States"}
                          </span>
                      </div>
                 </div>
             </div>

             {/* Vendor Listings */}
             <div className="px-4 mt-6">
                 <h3 className="font-bold text-sm text-slate-400 uppercase mb-2 ml-1">Active Listings ({vendorProducts.length})</h3>
                 <div className="grid grid-cols-2 gap-2">
                     {vendorProducts.map(product => (
                        <Card 
                           key={product.id} 
                           onClick={() => handleProductClick(product)}
                           className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                        >
                           <div className="aspect-square w-full bg-white relative">
                              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                           </div>
                           <div className="p-3">
                              <h3 className="font-bold text-xs line-clamp-2 mb-1">{product.title}</h3>
                              <div className="font-bold text-primary text-xs">{product.price} {product.currency}</div>
                           </div>
                        </Card>
                     ))}
                 </div>
             </div>
          </div>
      );
  }

  if (view === 'success') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-slate-400 text-sm mb-8">
          Your payment of <span className="text-white font-bold">{selectedProduct?.price} {selectedProduct?.currency}</span> has been sent to {authService.getUserById(selectedProduct?.sellerId || '')?.username}.
        </p>
        <button 
          onClick={() => {
            setSelectedProduct(null);
            setSearchQuery('');
            setView('home');
          }}
          className="bg-primary hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (view === 'checkout') {
    const shippingOption = selectedProduct?.shippingOptions.find(o => o.id === selectedShipping);
    const total = (selectedProduct?.price || 0) + (shippingOption?.priceUsd || 0); 

    return (
      <div className="pb-20 animate-in slide-in-from-right">
        {renderHeader()}
        <div className="p-2 space-y-4 mt-2">
           <h2 className="text-xl font-bold">Review Order</h2>
           
           {/* Item */}
           <Card className="p-4 flex gap-4">
              <img src={selectedProduct?.images[0]} alt={selectedProduct?.title} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                 <h3 className="font-bold text-sm line-clamp-2">{selectedProduct?.title}</h3>
                 <p className="text-primary font-bold mt-1">{selectedProduct?.price} {selectedProduct?.currency}</p>
              </div>
           </Card>

           {/* Shipping */}
           <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-400 uppercase">Delivery Method</h3>
              
              {/* Local Pickup Option if Available */}
              {selectedProduct?.location?.isLocalPickupAvailable && (
                  <div 
                    onClick={() => setSelectedShipping('local_pickup')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${selectedShipping === 'local_pickup' ? 'bg-primary/10 border-primary' : 'bg-surface border-white/10'}`}
                  >
                     <div className="flex items-center gap-2">
                         <MapPin size={16} />
                         <div>
                            <div className="font-bold text-sm">Local Pickup</div>
                            <div className="text-xs text-slate-400">{selectedProduct.location?.address}</div>
                         </div>
                     </div>
                     <div className="font-bold text-sm">Free</div>
                  </div>
              )}

              {selectedProduct?.shippingOptions.map(opt => (
                 <div 
                   key={opt.id}
                   onClick={() => setSelectedShipping(opt.id)}
                   className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${selectedShipping === opt.id ? 'bg-primary/10 border-primary' : 'bg-surface border-white/10'}`}
                 >
                    <div className="flex items-center gap-2">
                       <Truck size={16} />
                       <div>
                          <div className="font-bold text-sm">{opt.name}</div>
                          <div className="text-xs text-slate-400">{opt.estimatedDays}</div>
                       </div>
                    </div>
                    <div className="font-bold text-sm">
                       {opt.priceUsd === 0 ? 'Free' : `$${opt.priceUsd}`}
                    </div>
                 </div>
              ))}
           </div>

           {/* Summary */}
           <div className="bg-surface border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Item Subtotal</span>
                 <span>{selectedProduct?.price} {selectedProduct?.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Shipping</span>
                 <span>{selectedShipping === 'local_pickup' ? '$0' : `$${shippingOption?.priceUsd || 0}`}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-lg">
                 <span>Total</span>
                 <span>{selectedShipping === 'local_pickup' ? selectedProduct?.price : total} {selectedProduct?.currency}</span>
              </div>
           </div>

           <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
              <ShieldCheck size={14} /> Protected by Nova Escrow
           </div>

           <button 
             onClick={handleConfirmPurchase}
             disabled={isPurchasing}
             className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
           >
             {isPurchasing ? <Loader2 className="animate-spin" size={20} /> : `Confirm Payment`}
           </button>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedProduct) {
    // Fetch the seller again to ensure we have their latest info (mock)
    const seller = authService.getUserById(selectedProduct.sellerId);

    return (
      <div className="pb-20 animate-in slide-in-from-right">
        {renderHeader()}
        
        {/* Product Images */}
        <div className="aspect-square w-full bg-white relative">
           <img src={selectedProduct.images[0]} alt={selectedProduct.title} className="w-full h-full object-contain" />
           <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              1/{selectedProduct.images.length}
           </div>
        </div>

        <div className="p-4 space-y-6">
           {/* Title & Price */}
           <div>
              <h1 className="text-xl font-bold leading-snug">{selectedProduct.title}</h1>
              <div className="mt-2 flex items-baseline gap-2">
                 <span className="text-2xl font-bold text-primary">{selectedProduct.price} {selectedProduct.currency}</span>
                 <span className="text-sm text-slate-400">approx ${selectedProduct.price} USD</span>
              </div>
              <div className="mt-2 flex gap-2">
                 {selectedProduct.shippingOptions[0] && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-surface border border-white/10 rounded text-xs text-slate-300">
                        <Truck size={12} /> {selectedProduct.shippingOptions[0].name}
                    </div>
                 )}
                 {selectedProduct.location?.isLocalPickupAvailable && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400">
                        <MapPin size={12} /> Pickup Available
                    </div>
                 )}
              </div>
           </div>

           {/* Vendor Profile */}
           <div 
             onClick={() => handleVendorClick(selectedProduct.sellerId)}
             className="bg-surface/50 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-surface transition-colors"
           >
              <div className="flex items-center justify-between mb-3">
                 <h3 className="text-xs font-bold text-slate-500 uppercase">Seller Information</h3>
                 <span className="text-xs text-primary font-bold">View Profile</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5">
                    {seller?.profileImage ? (
                       <img src={seller.profileImage} className="w-full h-full rounded-full object-cover" />
                    ) : (
                       <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg">
                          {seller?.name[0]}
                       </div>
                    )}
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-1">
                       <span className="font-bold">{seller?.username}</span>
                       <CheckCircle size={14} className="text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                       <span className="flex items-center gap-0.5"><Star size={10} className="fill-yellow-400 text-yellow-400" /> {seller?.vendorStats?.rating}</span>
                       <span>•</span>
                       <span>{seller?.vendorStats?.totalSales} Sold</span>
                    </div>
                 </div>
              </div>
              
              {/* Description */}
              <div className="mt-4 pt-4 border-t border-white/5">
                 <h3 className="font-bold text-sm mb-2">Description</h3>
                 <p className="text-sm text-slate-300 leading-relaxed">{selectedProduct.description}</p>
              </div>

              {/* Location Preview */}
              <div className="mt-4 pt-4 border-t border-white/5">
                 <h3 className="font-bold text-sm mb-2">Item Location</h3>
                 <div className="flex items-center gap-2 text-sm text-slate-300">
                     <MapPin size={16} className="text-slate-500" />
                     {selectedProduct.location?.address || 'Location not specified'}
                 </div>
              </div>
           </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-white/10 max-w-md mx-auto">
           <button 
             onClick={handleBuyNow}
             className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25"
           >
              Buy Now
           </button>
        </div>
      </div>
    );
  }

  // --- Home View ---

  return (
    <div className="pb-20 animate-in fade-in">
      {renderHeader()}
      
      {/* Content Area */}
      <div className="p-2 grid grid-cols-2 gap-2 mt-2">
        {products.length === 0 ? (
          <div className="col-span-2 text-center py-10 opacity-50">
             <Search size={32} className="mx-auto mb-2 text-slate-500" />
             <p className="text-sm">No items found in {selectedCategory}</p>
          </div>
        ) : (
          products.map(product => (
            <Card 
               key={product.id} 
               onClick={() => handleProductClick(product)}
               className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group"
            >
               <div className="aspect-square w-full bg-white relative">
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.condition === 'New' && (
                     <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</div>
                  )}
               </div>
               <div className="p-3">
                  <h3 className="font-bold text-sm line-clamp-2 mb-1 h-10">{product.title}</h3>
                  <div className="font-bold text-primary text-sm">{product.price} {product.currency}</div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                     <span className="truncate max-w-[80px]">@{authService.getUserById(product.sellerId)?.username}</span>
                     <span className="flex items-center gap-0.5"><Star size={8} className="fill-yellow-400 text-yellow-400" /> 4.8</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500">
                     <MapPin size={8} /> {product.location?.address.split(',')[0] || 'Remote'}
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
