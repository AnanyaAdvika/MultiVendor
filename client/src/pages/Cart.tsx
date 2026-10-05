import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Leaf,
  Sparkles,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { formatCurrency, getTrustBadge } from '../utils/formatters.js';
import { SmartSavingsAlert } from '../components/customer/SmartSavingsAlert.js';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

export function Cart() {
  const { cart, loading, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Waiting</h2>
        <p className="text-xs text-slate-500">Sign in to view items, compare vendors, and save on checkout.</p>
        <Link
          to="/login"
          className="inline-block w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
        >
          Sign In to Access Cart
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!cart || cart.vendorGroups.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Discover best deals across our verified vendors and enjoy unified checkout!
        </p>
        <Link
          to="/products"
          className="inline-block w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
        >
          Browse Marketplace Catalog
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await api.validateCoupon(
        couponCode.trim(),
        cart.grandSubtotal,
        cart.hasEcoFriendlyItems
      );
      setAppliedCoupon(res);
      success(`Coupon ${res.code} applied! Saved ${formatCurrency(res.discountAmount)}`);
    } catch (err: any) {
      error(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const shippingFee = cart.grandSubtotal > 1000 ? 0 : 50;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, cart.grandSubtotal - discount + shippingFee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {itemCount} item(s) from {cart.vendorGroups.length} verified vendor(s) • Single Unified Checkout
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 p-2 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Empty Cart
        </button>
      </div>

      {/* SIGNATURE FEATURE 2: SMART CART SAVINGS BANNER */}
      {cart.savingsAnalysis && (
        <SmartSavingsAlert savings={cart.savingsAnalysis} />
      )}

      {/* Main Grid: Multi-Vendor Grouped Items + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Vendor-Grouped Packages (SIGNATURE FEATURE 3) */}
        <div className="lg:col-span-8 space-y-6">
          {cart.vendorGroups.map((group: any, groupIdx: number) => {
            const trust = getTrustBadge(group.vendor.trustMetrics.trustScore);

            return (
              <div
                key={group.vendor.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Package Header for this Vendor */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center">
                      {groupIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Package {groupIdx + 1} fulfilled by:</span>
                        <Link
                          to={`/products?vendor=${group.vendor.slug}`}
                          className="text-sm font-bold text-slate-900 hover:text-indigo-600"
                        >
                          {group.vendor.storeName}
                        </Link>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${trust.colorClass}`}>
                        <ShieldCheck className="w-3 h-3" /> {trust.badgeLabel} ({group.vendor.trustMetrics.trustScore}% Trust)
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                    Subtotal: {formatCurrency(group.subtotal)}
                  </span>
                </div>

                {/* Items in this vendor package */}
                <div className="divide-y divide-slate-100 p-6 space-y-4">
                  {group.items.map((item: any) => (
                    <div key={item.id} className="pt-4 first:pt-0 flex items-start gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={item.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <Link
                            to={`/products/${item.productId}`}
                            className="text-sm font-bold text-slate-900 hover:text-indigo-600 line-clamp-1"
                          >
                            {item.title}
                          </Link>

                          {item.isEcoFriendly && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <Leaf className="w-3 h-3 text-emerald-600" /> Eco-Packaging Choice
                            </span>
                          )}

                          <p className="text-xs font-extrabold text-slate-900">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900 block">
                              {formatCurrency(item.subtotal)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Coupon Application */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" /> Promo Code / Coupon
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10, ECOSAVE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 text-xs font-mono uppercase px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </div>

              {/* Quick coupons hint */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['WELCOME10', 'ECOSAVE', 'MEGA500'].map((code) => (
                  <button
                    type="button"
                    key={code}
                    onClick={() => setCouponCode(code)}
                    className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                  >
                    +{code}
                  </button>
                ))}
              </div>

              {appliedCoupon && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Coupon {appliedCoupon.code} active!
                  </span>
                  <span>-{formatCurrency(appliedCoupon.discountAmount)}</span>
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-bold text-slate-900">{formatCurrency(cart.grandSubtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Coupon Savings</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Estimated Tax</span>
                <span className="text-slate-400">Included</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-slate-900">
                <span className="text-sm font-extrabold">Total Amount</span>
                <span className="text-2xl font-black text-indigo-600">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Proceed to Single Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
