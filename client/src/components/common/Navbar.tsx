import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Leaf,
  Store,
  ShieldCheck,
  LogOut,
  Package,
  Layers,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';

export function Navbar() {
  const { user, logout, isCustomer, isVendor, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf7f2]/95 border-b border-[#e7ddd1] shadow-none backdrop-blur-xl">
      {/* Top Banner: Marketplace Highlights */}
      <div className="bg-[#3b2a20] text-[#f4e9dd] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Best Deal Guarantee: Compare prices across verified vendors
            </span>
            <span className="hidden md:inline text-stone-500">|</span>
            <Link to="/products?ecoFriendly=true" className="hidden md:flex items-center gap-1 text-stone-300 hover:text-emerald-400 transition-colors">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Eco-Friendly Choice available
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-stone-300 hover:text-white transition-colors">
              Demo Credentials
            </Link>
            {!user && (
              <>
                <span className="text-stone-600">•</span>
                <Link to="/signup?role=VENDOR" className="text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1">
                  <Store className="w-3 h-3" /> Sell on NexStore
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#4a3428] flex items-center justify-center text-white shadow-md shadow-amber-200 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-stone-900 via-amber-950 to-amber-700 bg-clip-text text-transparent">
                NexStore
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                Multi-Vendor Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products across all verified vendors (e.g. Sony WH-1000XM5, iPhone, Bamboo)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2 text-sm bg-stone-100/80 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1 text-xs font-semibold bg-[#4a3428] hover:bg-[#634735] text-white rounded-full transition-colors shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Links */}
            <Link
              to="/products"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-700 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4 text-stone-500" /> Catalog
            </Link>

            <Link
              to="/products?ecoFriendly=true"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Eco Deals
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-stone-600 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart with Multi-Vendor indicator */}
            <Link
              to="/cart"
              className="relative p-2 text-stone-600 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#4a3428] text-white text-[11px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-semibold ml-1 text-stone-700">Cart</span>
            </Link>

            {/* User Profile / Auth Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs font-semibold text-stone-800 leading-none">{user.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-stone-500 font-medium capitalize">{user.role.toLowerCase()}</p>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs text-stone-400">Signed in as</p>
                        <p className="text-sm font-bold text-stone-900 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 rounded-md">
                          {user.role}
                        </span>
                      </div>

                      {isCustomer && (
                        <>
                          <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-600">
                            <Package className="w-4 h-4 text-stone-400" /> My Orders & Tracking
                          </Link>
                          <Link to="/wishlist" className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-600">
                            <Heart className="w-4 h-4 text-stone-400" /> My Wishlist
                          </Link>
                        </>
                      )}

                      {isVendor && (
                        <>
                          <Link to="/vendor/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50">
                            <Store className="w-4 h-4 text-amber-600" /> Vendor Dashboard
                          </Link>
                          <Link to="/vendor/products" className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                            <Package className="w-4 h-4 text-stone-400" /> Manage Products
                          </Link>
                          <Link to="/vendor/orders" className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                            <Layers className="w-4 h-4 text-stone-400" /> Fulfill Orders
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50">
                          <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Command Center
                        </Link>
                      )}

                      <div className="border-t border-stone-100 my-1"></div>
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search and Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-stone-200">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-20 py-2 text-sm bg-stone-100 border border-stone-200 rounded-lg"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold bg-amber-600 text-white rounded-md"
                >
                  Search
                </button>
              </div>
            </form>
            <div className="flex flex-col gap-1 text-sm font-medium">
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-stone-700 hover:bg-stone-100 rounded-md">
                All Products & Catalog
              </Link>
              <Link to="/products?ecoFriendly=true" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-emerald-700 hover:bg-emerald-50 rounded-md flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" /> Eco-Friendly Catalog
              </Link>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-stone-700 hover:bg-stone-100 rounded-md">
                Order Tracking & History
              </Link>
              {isVendor && (
                <Link to="/vendor/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-amber-700 bg-amber-50 rounded-md">
                  Vendor Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-amber-700 bg-amber-50 rounded-md">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
