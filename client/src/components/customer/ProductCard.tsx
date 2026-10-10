import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { Product } from '../../types/index.js';
import { formatCurrency, getTrustBadge } from '../../utils/formatters.js';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);
  const trustBadge = getTrustBadge(product.vendor.trustScore);
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
    } catch {
      // Handled in context
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-[#e7ddd1]/80 shadow-sm hover:shadow-xl hover:border-stone-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Container */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-stone-50">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase bg-rose-500 text-white rounded-full shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isEcoFriendly && (
            <span className="px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 bg-emerald-600 text-white rounded-full shadow-sm">
              <Leaf className="w-3 h-3" /> Eco Choice
            </span>
          )}
          {product.catalogGroup && (
            <span className="px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 bg-[#4a3428] text-white rounded-full shadow-sm">
              <Sparkles className="w-2.5 h-2.5" /> Best Deal Available
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            inWishlist
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'bg-white/80 text-stone-400 hover:text-rose-500 hover:bg-white shadow-sm'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/95 text-stone-800 text-xs font-bold px-3 py-1.5 rounded-full shadow">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor Trust & Rating row */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <Link
              to={`/products?vendor=${product.vendor.slug}`}
              className="font-medium text-stone-700 hover:text-amber-600 truncate max-w-[150px] flex items-center gap-1"
              title={product.vendor.storeName}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{product.vendor.storeName}</span>
            </Link>
            <div className="flex items-center gap-1 shrink-0 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating > 0 ? product.rating.toFixed(1) : '4.5'}</span>
              <span className="text-stone-400">({product.numReviews})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product.slug}`}
            className="block text-sm font-semibold text-stone-900 hover:text-amber-600 line-clamp-2 leading-snug mb-2 group-hover:text-amber-600 transition-colors"
          >
            {product.title}
          </Link>
        </div>

        {/* Pricing and Action row */}
        <div className="pt-2 border-t border-stone-100 mt-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-stone-900">
                  {formatCurrency(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xs text-stone-400 line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">
                {product.stock > 0 ? (
                  product.stock <= 5 ? (
                    <span className="text-amber-600 font-semibold">Only {product.stock} left</span>
                  ) : (
                    'In Stock'
                  )
                ) : (
                  <span className="text-stone-400">Currently unavailable</span>
                )}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`p-2.5 rounded-xl font-medium text-xs flex items-center justify-center transition-all ${
                product.stock > 0
                  ? 'bg-[#4a3428] hover:bg-[#634735] active:scale-95 text-white shadow-md shadow-amber-100 hover:shadow-amber-200'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
              title="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
