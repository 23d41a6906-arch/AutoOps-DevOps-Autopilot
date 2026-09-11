import React, { useState } from 'react';
import { useStore, store } from '../../simulator/store';
import { INITIAL_PRODUCTS } from '../../data/scenarios';
import { Product } from '../../types';
import {
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Package,
  ArrowRight,
  ShieldCheck,
  Search,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';

export const NovaCart: React.FC = () => {
  const state = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { items, isCheckingOut, checkoutError, lastOrder, notification } = state.novaCart;
  const isBroken =
    state.stage !== 'HEALTHY' &&
    state.stage !== 'RESOLVED' &&
    (state.activeIncident?.scenario.targetService === 'checkout' ||
      state.activeIncident?.scenario.targetService === 'database' ||
      state.activeIncident?.scenario.targetService === 'payment' ||
      state.activeIncident?.scenario.targetService === 'gateway');

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(cartSubtotal * 0.08);
  const total = cartSubtotal + tax;

  const filteredProducts = INITIAL_PRODUCTS.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || prod.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full bg-[#FAFAFC] rounded-xl border border-[#E4E7EC] overflow-hidden shadow-xs">
      {/* NovaCart Storefront Header */}
      <div className="bg-white border-b border-[#E4E7EC] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2E5FF2] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            NC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#101828] tracking-tight">NovaCart</span>
              <span className="text-[10px] px-1.5 py-0.5 font-medium rounded-full bg-[#EFF4FF] text-[#2E5FF2] border border-[#D1E0FF]">
                LIVE STORE
              </span>
            </div>
            <p className="text-[11px] text-[#667085]">Simulated Production E-Commerce Application</p>
          </div>
        </div>

        {/* Live Service Indicator in NovaCart */}
        <div className="flex items-center gap-2">
          {isBroken ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3F2] border border-[#FECDCA] text-[#F04438] text-xs font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#F04438]" />
              CHECKOUT DEGRADED (500)
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] border border-[#A6F4C5] text-[#12B76A] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
              APIs HEALTHY (200 OK)
            </div>
          )}

          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#475467]" />
            Cart
            {cartCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#2E5FF2] text-white text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between ${
            notification.type === 'error'
              ? 'bg-[#FEF3F2] text-[#B42318] border-b border-[#FECDCA]'
              : notification.type === 'success'
              ? 'bg-[#ECFDF3] text-[#027A48] border-b border-[#A6F4C5]'
              : 'bg-[#EFF4FF] text-[#175CD3] border-b border-[#D1E0FF]'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#F04438]" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0 text-[#12B76A]" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => store.dismissNotification()}
            className="text-[11px] underline font-semibold ml-2 hover:opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Product Catalog Column */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 border-r border-[#E4E7EC]">
          {/* Search and Category bar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#98A2B3]" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#2E5FF2]"
              />
            </div>
            <div className="flex items-center gap-1">
              {['All', 'Hardware', 'Peripherals', 'Displays', 'Audio'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#2E5FF2] text-white'
                      : 'bg-white text-[#475467] border border-[#E4E7EC] hover:bg-[#F2F4F7]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-[#E4E7EC] rounded-xl p-3 flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="h-28 w-full bg-[#F2F4F7] rounded-lg overflow-hidden mb-2 relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/90 text-[#344054] text-[10px] font-semibold backdrop-blur-xs">
                      {prod.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-[#101828] line-clamp-1">{prod.name}</h4>
                  <p className="text-[11px] text-[#667085] line-clamp-2 mt-0.5 mb-2">{prod.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F2F4F7] mt-1">
                  <div>
                    <span className="text-xs font-bold text-[#101828]">${prod.price}</span>
                    <span className="text-[10px] text-[#98A2B3] ml-1">in stock ({prod.stock})</span>
                  </div>
                  <button
                    onClick={() => store.addCartItem(prod)}
                    className="px-2.5 py-1 rounded-lg bg-[#EFF4FF] hover:bg-[#D1E0FF] text-[#2E5FF2] font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Failure Demo Helper Banner inside NovaCart */}
          <div className="mt-4 p-3 rounded-lg bg-[#F8F9FC] border border-[#D0D5DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2E5FF2]" />
              <span className="text-xs text-[#344054]">
                Judge test: Add items to cart and click <strong>Pay & Place Order</strong> below.
              </span>
            </div>
            {isBroken ? (
              <span className="text-[11px] font-bold text-[#F04438]">Failure Active (Will Return 500)</span>
            ) : (
              <span className="text-[11px] font-bold text-[#12B76A]">Healthy (Will Succeed)</span>
            )}
          </div>
        </div>

        {/* Cart & Checkout Panel */}
        <div className="w-80 bg-white flex flex-col justify-between p-4 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] mb-3">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-[#2E5FF2]" />
                <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  Checkout Cart ({cartCount})
                </h3>
              </div>
              <span className="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded">
                API: /api/v1/checkout
              </span>
            </div>

            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="w-8 h-8 text-[#D0D5DD] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#667085]">Your cart is empty</p>
                <p className="text-[11px] text-[#98A2B3]">Add products from the catalog</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-[#F2F4F7] bg-[#FAFAFC]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-8 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#101828] truncate">{item.name}</p>
                        <p className="text-[11px] text-[#667085]">
                          ${item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => store.updateCartQuantity(item.id, -1)}
                        className="w-5 h-5 rounded border border-[#D0D5DD] bg-white text-xs font-bold flex items-center justify-center hover:bg-[#F2F4F7] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => store.updateCartQuantity(item.id, 1)}
                        className="w-5 h-5 rounded border border-[#D0D5DD] bg-white text-xs font-bold flex items-center justify-center hover:bg-[#F2F4F7] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Banner when incident active */}
            {checkoutError && (
              <div className="mt-3 p-3 rounded-lg bg-[#FEF3F2] border border-[#FECDCA]">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F04438] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-[#B42318]">Checkout Interrupted</h5>
                    <p className="text-[11px] text-[#B42318] mt-0.5 font-mono break-all">
                      {checkoutError}
                    </p>
                    <p className="text-[10px] text-[#912018] mt-1.5 font-medium">
                      💡 Click <strong>⚡ Run Autonomous Recovery</strong> in the AutoOps header to remediate.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Last Order Success Banner */}
            {lastOrder && !checkoutError && (
              <div className="mt-3 p-3 rounded-lg bg-[#ECFDF3] border border-[#A6F4C5]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#12B76A] shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-[#027A48]">Order Confirmed!</h5>
                    <p className="text-[11px] text-[#027A48]">
                      Order #{lastOrder.orderId} placed at {lastOrder.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Totals & Button */}
          <div className="pt-3 border-t border-[#E4E7EC] mt-3">
            <div className="space-y-1 text-xs text-[#667085] mb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#101828]">${cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span>${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#101828] pt-1 border-t border-[#F2F4F7]">
                <span>Total</span>
                <span className="text-[#2E5FF2]">${total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => store.checkoutNovaCart()}
              disabled={items.length === 0 || isCheckingOut}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                items.length === 0
                  ? 'bg-[#EAECF0] text-[#98A2B3] cursor-not-allowed'
                  : isBroken
                  ? 'bg-[#F04438] hover:bg-[#D92D20] text-white'
                  : 'bg-[#2E5FF2] hover:bg-[#1D4ED8] text-white'
              }`}
            >
              {isCheckingOut ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Processing Transaction...
                </>
              ) : isBroken ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Pay & Place Order (Failing 500)
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Pay & Place Order (${total.toLocaleString()})
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
