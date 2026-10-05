import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { SmartCartSavingsSummary } from '../../types/index.js';
import { formatCurrency, getTrustBadge } from '../../utils/formatters.js';
import { useCart } from '../../context/CartContext.js';

interface SmartSavingsAlertProps {
  savings: SmartCartSavingsSummary;
}

export function SmartSavingsAlert({ savings }: SmartSavingsAlertProps) {
  const { switchVendor } = useCart();

  if (!savings) return null;

  const itemsWithCheaper = savings.items.filter((it) => it.cheaperAlternative !== null);

  if (itemsWithCheaper.length === 0 && (!savings.recommendedCoupons || savings.recommendedCoupons.length === 0)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border-2 border-emerald-400/50 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Smart Cart Savings Found!
            </h3>
            <p className="text-xs text-slate-600">
              NexStore found cheaper seller alternatives and eligible coupons for your cart.
            </p>
          </div>
        </div>

        {savings.totalAlternativeSavings > 0 && (
          <div className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm animate-bounce">
            Save {formatCurrency(savings.totalAlternativeSavings)} Now
          </div>
        )}
      </div>

      {/* Cheaper Vendor Opportunities */}
      {itemsWithCheaper.length > 0 && (
        <div className="space-y-2.5">
          {itemsWithCheaper.map((item) => {
            const alt = item.cheaperAlternative!;
            const trust = getTrustBadge(alt.vendorTrustScore);

            return (
              <div
                key={item.cartItemId}
                className="bg-white/90 backdrop-blur-sm border border-emerald-300/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-xs">
                      {item.productTitle}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (from {item.currentVendorName})
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    💡 You can save <span className="underline">{formatCurrency(alt.totalSavings)}</span> by buying this item from <span className="font-extrabold">{alt.vendorName}</span>!
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="text-slate-400 line-through">{formatCurrency(item.currentPrice)}</span>
                    <span className="text-emerald-700 font-bold">{formatCurrency(alt.price)} each</span>
                    <span>•</span>
                    <span className={`inline-flex items-center gap-0.5 font-medium ${trust.colorClass}`}>
                      <ShieldCheck className="w-3 h-3" /> {alt.vendorBadge} ({alt.vendorTrustScore}% Trust)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => switchVendor(item.cartItemId, alt.productId)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                >
                  Switch & Save {formatCurrency(alt.totalSavings)}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Coupon Recommendations */}
      {savings.recommendedCoupons && savings.recommendedCoupons.length > 0 && (
        <div className="pt-2 border-t border-slate-200/50 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-indigo-500" /> Recommended Coupons:
          </span>
          {savings.recommendedCoupons.map((coupon) => (
            <span
              key={coupon.code}
              className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg font-mono font-bold text-[11px]"
            >
              {coupon.code} (Save ~{formatCurrency(coupon.estimatedDiscount)})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
