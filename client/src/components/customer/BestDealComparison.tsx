import React from 'react';
import { Sparkles, ShieldCheck, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { DealsComparison, VendorAlternative } from '../../types/index.js';
import { formatCurrency, getTrustBadge } from '../../utils/formatters.js';
import { useCart } from '../../context/CartContext.js';

interface BestDealComparisonProps {
  comparison: DealsComparison;
  onSelectAlternative?: (productId: string) => void;
}

export function BestDealComparison({ comparison, onSelectAlternative }: BestDealComparisonProps) {
  const { addToCart } = useCart();
  const { deals, currentProduct, maxPossibleSavings } = comparison;

  if (!deals || deals.length <= 1) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-sm text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Exclusive Verified Seller</h4>
            <p className="text-xs text-slate-500">
              {currentProduct.vendor.storeName} is the verified primary supplier for this product.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Trust Score {currentProduct.vendor.trustScore}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
      {/* Header with savings alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-100 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Multi-Vendor Price Comparison</h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                {deals.length} Sellers Available
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Multiple approved vendors offer this product. Choose the cheapest price or highest trust rating.
            </p>
          </div>
        </div>

        {maxPossibleSavings > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-right">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Potential Savings</p>
            <p className="text-sm font-extrabold text-emerald-700">Save up to {formatCurrency(maxPossibleSavings)}</p>
          </div>
        )}
      </div>

      {/* Comparison Deals List */}
      <div className="mt-5 space-y-3">
        {deals.map((deal) => {
          const trust = getTrustBadge(deal.vendorTrustScore);
          const isCurrent = deal.isCurrentItem;

          return (
            <div
              key={deal.productId}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                deal.isBestDeal
                  ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-300/40'
                  : isCurrent
                  ? 'bg-indigo-50/30 border-indigo-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Vendor Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shadow-sm">
                  {deal.storeName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{deal.storeName}</span>
                    {deal.isBestDeal && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500 text-white rounded-full shadow-sm animate-pulse">
                        🔥 Lowest Price Deal
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded-full">
                        Currently Viewing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className={`inline-flex items-center gap-1 font-semibold ${trust.colorClass}`}>
                      <ShieldCheck className="w-3.5 h-3.5" /> {trust.badgeLabel} ({deal.vendorTrustScore}% Trust)
                    </span>
                    <span>•</span>
                    <span className="text-slate-600">Stock: {deal.stock > 0 ? `${deal.stock} units` : 'Out of stock'}</span>
                    {deal.isEcoFriendly && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">🌿 Eco packaging</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Price and CTA Button */}
              <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                <div className="text-left md:text-right">
                  <div className="flex items-baseline gap-1.5 md:justify-end">
                    <span className="text-lg font-extrabold text-slate-900">
                      {formatCurrency(deal.price)}
                    </span>
                    {deal.compareAtPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(deal.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  {deal.savingsVsCurrent > 0 ? (
                    <p className="text-xs font-bold text-emerald-600">
                      Saves {formatCurrency(deal.savingsVsCurrent)} vs this page!
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">Free Express Delivery</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isCurrent ? (
                    <button
                      onClick={() => addToCart(deal.productId, 1)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add Current
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onSelectAlternative) {
                          onSelectAlternative(deal.productId);
                        } else {
                          addToCart(deal.productId, 1);
                        }
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                        deal.isBestDeal
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {deal.isBestDeal ? 'Buy Best Deal' : 'Buy from this Vendor'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
