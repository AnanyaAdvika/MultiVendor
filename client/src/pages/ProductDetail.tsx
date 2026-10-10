import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Leaf,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MessageSquare,
  BellRing,
} from 'lucide-react';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';
import { formatCurrency, getTrustBadge, formatDate } from '../utils/formatters.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { BestDealComparison } from '../components/customer/BestDealComparison.js';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [priceTarget, setPriceTarget] = useState('');
  const [priceWatchSaved, setPriceWatchSaved] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await api.getProduct(slug);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (err: any) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    try {
      const watches = JSON.parse(localStorage.getItem('nexstore-price-watches') || '[]') as Array<{ productId: string; targetPrice: number }>;
      const watch = watches.find((item) => item.productId === product.id);
      setPriceWatchSaved(Boolean(watch));
      setPriceTarget(watch ? String(watch.targetPrice) : String(Math.max(1, Math.floor(product.price * 0.9))));
      if (watch && product.price <= watch.targetPrice) success('Price watch update: this product is at or below your target price.');
    } catch {
      setPriceWatchSaved(false);
      setPriceTarget(String(Math.max(1, Math.floor(product.price * 0.9))));
    }
  }, [product?.id]);

  const handlePriceWatch = () => {
    if (!product) return;
    try {
      const watches = JSON.parse(localStorage.getItem('nexstore-price-watches') || '[]') as Array<{ productId: string; productTitle: string; currentPrice: number; targetPrice: number; createdAt: string }>;
      if (priceWatchSaved) {
        localStorage.setItem('nexstore-price-watches', JSON.stringify(watches.filter((item) => item.productId !== product.id)));
        setPriceWatchSaved(false);
        success('Price watch removed from this browser.');
        return;
      }
      const target = Number(priceTarget);
      if (!Number.isFinite(target) || target <= 0 || target >= product.price) {
        error('Enter a target price lower than the current price.');
        return;
      }
      const next = watches.filter((item) => item.productId !== product.id);
      next.push({ productId: product.id, productTitle: product.title, currentPrice: product.price, targetPrice: target, createdAt: new Date().toISOString() });
      localStorage.setItem('nexstore-price-watches', JSON.stringify(next));
      setPriceWatchSaved(true);
      success('Price watch saved on this browser. Revisit the product to check for a target-price match.');
    } catch {
      error('Could not save the price watch in this browser.');
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
    } catch {
      // Handled in context
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch {
      // Handled in context
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) {
      error('Please log in to submit a review');
      return;
    }
    if (!reviewComment.trim()) {
      error('Please write your review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      await api.addReview(product.id, reviewRating, reviewComment.trim());
      success('Thank you! Your review has been published.');
      setReviewComment('');
      // Reload product data to refresh rating
      const refreshed = await api.getProduct(product.slug);
      setProduct(refreshed);
    } catch (err: any) {
      error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-800">Product Not Found</h2>
        <Link to="/products" className="text-amber-600 font-semibold hover:underline">
          Return to Marketplace Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const trustBadge = getTrustBadge(product.vendor.trustScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Product Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-[#e7ddd1] overflow-hidden shadow-xs relative">
            <img
              src={selectedImage || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {product.discountPercent}% OFF
              </span>
            )}
            {product.isEcoFriendly && (
              <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Leaf className="w-3.5 h-3.5" /> Eco-Certified
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-amber-600 scale-95 shadow-sm' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Buying Options */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <Link to={`/products?category=${product.category.slug}`} className="font-semibold text-amber-600 hover:underline">
              {product.category.name}
            </Link>
            {product.sku && <span className="font-mono text-stone-400">SKU: {product.sku}</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
            {product.title}
          </h1>

          {/* Rating and Reviews summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating > 0 ? product.rating.toFixed(1) : '4.8'}</span>
            </div>
            <span className="text-xs text-stone-500">
              {product.numReviews} Verified Buyer Ratings
            </span>
          </div>

          {/* Primary Seller Box with Trust Badge */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-800 font-bold text-sm shadow-xs">
                {product.vendor.storeName.charAt(0)}
              </div>
              <div>
                <Link to={`/products?vendor=${product.vendor.slug}`} className="text-sm font-bold text-stone-900 hover:text-amber-600">
                  {product.vendor.storeName}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${trustBadge.colorClass}`}>
                    <ShieldCheck className="w-3.5 h-3.5" /> {trustBadge.badgeLabel}
                  </span>
                  <span className="text-stone-400 text-xs">•</span>
                  <span className="text-xs text-stone-600 font-semibold">{product.vendor.trustScore}% Trust Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-stone-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base text-stone-400 line-through font-medium">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Save {product.discountPercent}%
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">Inclusive of all taxes. Free delivery on orders over ₹1,000</p>
          </div>

          {/* Local price watch: browser-only reminder, no push/email claim */}
          <div className="rounded-2xl border border-[#e7ddd1] bg-[#f8f2ec] p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <BellRing className="w-4 h-4 text-[#8a6042] mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#4a3428]">Watch this price</p>
                <p className="text-xs text-[#806b5a] mt-0.5">Save a target on this device and check back for a price match.</p>
              </div>
              {priceWatchSaved && <span className="text-[10px] font-bold uppercase tracking-wide text-[#5d6b4d]">Watching</span>}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 text-[11px] text-[#806b5a]">Target price (₹)
                <input type="number" min="1" max={product.price - 1} value={priceTarget} onChange={(e) => setPriceTarget(e.target.value)} disabled={priceWatchSaved} className="mt-1 block w-full rounded-xl border border-[#dfd0c1] bg-white px-3 py-2 text-sm text-[#33261f] focus:outline-none focus:ring-2 focus:ring-[#b99373] disabled:opacity-60" />
              </label>
              <button type="button" onClick={handlePriceWatch} className="self-end rounded-full border border-[#bca087] px-4 py-2.5 text-xs font-semibold text-[#654735] hover:bg-[#eee1d4]">
                {priceWatchSaved ? 'Remove watch' : 'Set price watch'}
              </button>
            </div>
          </div>

          {/* Eco-Friendly Feature Callout */}
          {product.isEcoFriendly && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <Leaf className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Eco-Conscious Product
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {product.ecoDetails || 'This product and its packaging meet sustainable, zero-plastic and carbon-neutral standards.'}
                </p>
              </div>
            </div>
          )}

          {/* Stock & Quantity */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-stone-700">Quantity:</span>
            <div className="flex items-center border border-stone-200 rounded-xl bg-white shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-bold"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-xs font-bold text-stone-800">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-bold"
              >
                +
              </button>
            </div>
            <span className="text-xs text-stone-500">
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <span className="text-amber-600 font-bold">Only {product.stock} units remaining</span>
                ) : (
                  <span className="text-emerald-600 font-medium">In Stock ({product.stock} units)</span>
                )
              ) : (
                <span className="text-rose-500 font-bold">Out of stock</span>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                product.stock > 0
                  ? 'bg-[#4a3428] hover:bg-[#634735] text-white shadow-lg shadow-amber-100 active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Add to Multi-Vendor Cart
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className={`py-3.5 px-6 rounded-xl font-bold text-sm transition-all ${
                product.stock > 0
                  ? 'bg-stone-900 hover:bg-stone-800 text-white active:scale-95 shadow-md'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              Buy Now
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3.5 rounded-xl border transition-all ${
                inWishlist
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-white border-stone-200 text-stone-500 hover:text-rose-500 hover:bg-stone-50'
              }`}
              title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Marketplace Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100 text-[11px] text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              <span>Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span>7-Day Return Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Verified Seller</span>
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURE FEATURE 1: BEST DEAL COMPARISON TABLE */}
      {product.dealsComparison && (
        <section className="pt-4">
          <BestDealComparison
            comparison={product.dealsComparison}
            onSelectAlternative={(altProductId) => {
              const altDeal = product.dealsComparison?.deals.find((d) => d.productId === altProductId);
              if (altDeal) {
                addToCart(altProductId, quantity);
              }
            }}
          />
        </section>
      )}

      {/* Description & Specs */}
      <section className="bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
        <h3 className="text-lg font-bold text-stone-900">Product Details & Specifications</h3>
        <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </section>

      {/* Ratings and Reviews Section */}
      <section className="bg-white rounded-3xl border border-stone-200 p-8 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Customer Ratings & Reviews</h3>
            <p className="text-xs text-stone-500 mt-0.5">Real verified buyer feedback</p>
          </div>
          <div className="flex items-center gap-1.5 text-base font-black text-amber-500">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'} / 5.0</span>
          </div>
        </div>

        {/* Write a review form */}
        <form onSubmit={handleReviewSubmit} className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-4">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-amber-600" /> Share Your Product Experience
          </h4>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= reviewRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-stone-700 ml-2">{reviewRating} Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Your Review</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell others about product quality, value for money, and vendor delivery..."
              className="w-full text-xs p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={submittingReview}
            className="px-5 py-2.5 bg-[#4a3428] hover:bg-[#634735] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-stone-100 bg-stone-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                      {rev.user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-stone-800">{rev.user.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>
                <p className="text-[10px] text-stone-400">{formatDate(rev.createdAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 text-center py-6">
              No reviews yet. Be the first customer to share your thoughts!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
