'use client';
import { useCart } from '@/app/context/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Trash2, 
  Minus, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag,
  Edit3
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
  _id?: string;
}

interface Product {
  _id: string;
  name: string;
  image?: string;
  price?: number; // Optional for namkeens
  pricing?: Pricing[]; // Optional for boxes
}

export default function ImprovedCartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, addToCart } = useCart();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingSize, setEditingSize] = useState<{[key: string]: boolean}>({});
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Fetch all product types for suggestions
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const [productsRes, namkeensRes, boxesRes] = await Promise.all([
          axios.get('/api/product'),
          axios.get('/api/namkeen'),
          axios.get('/api/box')
        ]);
        
        const combined = [
          ...productsRes.data, 
          ...namkeensRes.data,
          ...boxesRes.data
        ];
        setAllProducts(combined);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchAllProducts();
  }, []);

  // Get suggested products from combined data (excluding items already in cart)
  const cartProductIds = cart.map(item => item.product._id);
  const suggestedProducts = allProducts
    .filter(product => !cartProductIds.includes(product._id))
    .slice(0, 5);

  // Auto-slide effect for suggestions
  useEffect(() => {
    if (suggestedProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % suggestedProducts.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [suggestedProducts.length]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      console.log('Updating quantity:', { productId, newQuantity });
      if (newQuantity < 1) {
        await removeFromCart(productId);
      } else {
        await updateQuantity(productId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleAddSuggestedProduct = async (productId: string) => {
    try {
      // Get the product data to determine type and pricing
      const product = suggestedProducts.find(p => p._id === productId);
      if (!product) {
        console.error('Product not found in suggestions');
        return;
      }

      console.log('Adding suggested product:', {
        id: productId,
        name: product.name,
        pricing: product.pricing,
        price: product.price
      });

      // Determine product type and handle pricing accordingly
      if (product.pricing && Array.isArray(product.pricing) && product.pricing.length > 0) {
        // Namkeen or Product with pricing array - use first pricing option as default
        await addToCart(productId, 1, product.pricing[0]);
      } else if (product.price) {
        // Box or Product with simple price - create pricing object
        const simplePricing: Pricing = {
          quantity: 1,
          unit: 'piece',
          price: product.price
        };
        await addToCart(productId, 1, simplePricing);
      } else {
        console.error('No pricing information found for product:', product);
        alert('Unable to add product - pricing information missing');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  const handleSizeEdit = async (productId: string, newPricing: Pricing) => {
    try {
      console.log('Starting size change:', { productId, newPricing });
      
      // Find current cart item to get current quantity
      const currentItem = cart.find(item => item.product._id === productId);
      const currentQuantity = currentItem?.quantity || 1;
      
      console.log('Current quantity:', currentQuantity);
      
      // Remove current item and add with new pricing
      await removeFromCart(productId);
      console.log('Item removed from cart');
      
      await addToCart(productId, currentQuantity, newPricing);
      console.log('Item added back with new pricing');
      
      // Close the dropdown
      setEditingSize(prev => ({ ...prev, [productId]: false }));
      console.log('Size change completed successfully');
      
    } catch (error) {
      console.error('Error changing size:', error);
      alert('Failed to change size. Please try again.');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      // Use selectedPricing price if available, otherwise fall back to product price
      const itemPrice = item.selectedPricing?.price || item.product.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const total = calculateTotal();

  const nextSlide = () => {
    if (suggestedProducts.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % suggestedProducts.length);
    }
  };

  const prevSlide = () => {
    if (suggestedProducts.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + suggestedProducts.length) % suggestedProducts.length);
    }
  };

  const handleContinueShopping = () => {
    onClose();
    router.push('/');
  };

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  const getUnitDisplay = (unit: string) => {
    const unitMap: Record<string, string> = {
      'gm': 'g',
      'kg': 'kg',
      'piece': 'pc',
      'dozen': 'dz'
    };
    return unitMap[unit] || unit;
  };

  // Get available pricing options for a product
  const getProductPricingOptions = (productId: string): Pricing[] => {
    // First check the cart item for pricing data
    const cartItem = cart.find(item => item.product._id === productId);
    if (cartItem && cartItem.product.pricing) {
      return cartItem.product.pricing;
    }
    
    // Fallback to combined products data
    const product = allProducts.find(p => p._id === productId);
    if (product && product.pricing) {
      return product.pricing;
    }
    
    console.log('No pricing found for product:', productId);
    return [];
  };

  // Close dropdown when clicking outside using useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.pricing-dropdown') && !target.closest('.edit-button')) {
        setEditingSize({});
      }
    };

    if (Object.values(editingSize).some(editing => editing)) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editingSize]);

  // Close drawer when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Blurred Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20 transition-all duration-300"
          onClick={handleBackdropClick}
        />
      )}
      
      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-all duration-300 ease-in-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-white">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                Cart ({cart.length})
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4 text-sm">Discover our amazing products and start shopping!</p>
              <button 
                onClick={handleContinueShopping}
                className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="p-3">
              <div className="space-y-3">
                {cart.map((item) => {
                  const pricingOptions = getProductPricingOptions(item.product._id);
                  const isEditing = editingSize[item.product._id];
                  
                  // Calculate display price
                  const displayPrice = item.selectedPricing?.price || item.product.price || 0;
                  
                  return (
                    <div key={item.product._id} className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow relative">
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <Image
                            src={item.product.image || '/api/placeholder/60/60'}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm leading-tight">
                                {item.product.name}
                              </h3>
                              
                              {/* Size Display with Edit Option */}
                              <div className="flex items-center gap-2 mt-1">
                                {item.selectedPricing ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                      {item.selectedPricing.quantity}{getUnitDisplay(item.selectedPricing.unit)}
                                    </span>
                                    {pricingOptions.length > 1 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingSize(prev => ({ ...prev, [item.product._id]: !prev[item.product._id] }));
                                        }}
                                        className="edit-button p-0.5 hover:bg-gray-100 rounded transition-colors relative z-10"
                                        title="Change size"
                                      >
                                        <Edit3 className="h-3 w-3 text-gray-400" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    Standard size
                                  </span>
                                )}
                              </div>
                            </div>
                            <button 
                              onClick={() => item.product._id && removeFromCart(item.product._id)} 
                              className="p-1 hover:bg-red-50 rounded-full transition-colors group ml-2 relative z-10"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-500" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900 text-sm">
                              ₹{displayPrice.toFixed(2)}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 relative z-10">
                              <button
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                onClick={() => item.product._id && handleQuantityChange(item.product._id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                              <button
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                onClick={() => item.product._id && handleQuantityChange(item.product._id, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Size Edit Dropdown - Positioned absolutely within the item */}
                      {isEditing && pricingOptions.length > 1 && (
                        <div className="pricing-dropdown absolute top-full left-3 right-3 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[200] max-h-32 overflow-y-auto">
                          {pricingOptions.map((pricing, index) => (
                            <button
                              key={index}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Pricing option clicked:', pricing);
                                handleSizeEdit(item.product._id, pricing);
                              }}
                              className={`pricing-option w-full flex items-center justify-between p-2 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 text-left cursor-pointer ${
                                item.selectedPricing &&
                                item.selectedPricing.quantity === pricing.quantity &&
                                item.selectedPricing.unit === pricing.unit &&
                                item.selectedPricing.price === pricing.price
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              <span className="text-xs font-medium">
                                {pricing.quantity}{getUnitDisplay(pricing.unit)}
                              </span>
                              <span className="text-xs font-bold text-orange-600">
                                ₹{pricing.price}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions Section */}
        {suggestedProducts.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 p-3">
            <h3 className="text-sm font-medium text-gray-800 mb-2">You might also like</h3>
            <div className="relative">
              <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                <div className="flex items-center gap-2.5">
                  <Image
                    src={suggestedProducts[currentSlide]?.image || '/api/placeholder/40/40'}
                    alt={suggestedProducts[currentSlide]?.name || 'Product'}
                    width={40}
                    height={40}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                      {suggestedProducts[currentSlide]?.name}
                    </h4>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{(suggestedProducts[currentSlide]?.pricing?.[0]?.price ?? 
                          suggestedProducts[currentSlide]?.price ?? 0).toFixed(2)}
                      </span>
                      {suggestedProducts[currentSlide]?.pricing?.[0] ? (
                        <span className="text-xs text-gray-500">
                          {suggestedProducts[currentSlide].pricing![0].quantity}
                          {getUnitDisplay(suggestedProducts[currentSlide].pricing![0].unit)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">per piece</span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="bg-orange-500 text-white p-1.5 rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0"
                    onClick={() => handleAddSuggestedProduct(suggestedProducts[currentSlide]._id)}
                    aria-label="Add to cart"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Slider Navigation */}
              {suggestedProducts.length > 1 && (
                <div className="flex justify-between items-center mt-2">
                  <button 
                    onClick={prevSlide} 
                    className="p-1 hover:bg-white rounded-full transition-colors"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="flex gap-1">
                    {suggestedProducts.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          index === currentSlide ? 'bg-orange-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={nextSlide} 
                    className="p-1 hover:bg-white rounded-full transition-colors"
                    aria-label="Next product"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compact Footer */}
        <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-white">
          {cart.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-medium text-gray-800">Total:</span>
                <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
              
              <button 
                className="w-full bg-orange-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors mb-2 flex items-center justify-center gap-2"
                onClick={handleCheckout}
              >
                <ShoppingBag className="h-4 w-4" />
                Checkout
              </button>
            </>
          )}
          
          <button 
            className="w-full text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors py-1"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}

