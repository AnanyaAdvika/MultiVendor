import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Leaf, Sparkles, HeartHandshake, Truck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Marketplace Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Best Deal Comparison</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Compare identical products across multiple verified vendors to get the guaranteed lowest market price.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Eco-Friendly Living</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Shop zero-waste, plastic-free items with certified green packaging and carbon-neutral deliveries.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Vendor Trust Score</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Our algorithmic trust rating verifies seller order success rates, customer reviews, and timely delivery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">One Cart, Multi-Vendor</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Combine items from multiple vendors in a single checkout. Automated order splitting and package tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links & Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">NexStore</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Next-generation multi-vendor marketplace connecting verified sellers, smart deal comparison, and conscious buyers.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-medium text-emerald-400 border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Marketplace</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics & Gadgets</Link></li>
              <li><Link to="/products?category=audio" className="hover:text-white transition-colors">Headphones & Audio</Link></li>
              <li><Link to="/products?ecoFriendly=true" className="hover:text-emerald-400 transition-colors">Eco-Friendly Store</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Smart Cart Savings</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Vendor & Partner</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/signup?role=VENDOR" className="hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link to="/vendor/dashboard" className="hover:text-white transition-colors">Vendor Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Vendor Sign In</Link></li>
              <li><span className="text-slate-500">Commission Rate: 5% flat</span></li>
              <li><span className="text-slate-500">Trust Score Guidelines</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Demo Credentials</h5>
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 text-xs space-y-1.5 font-mono">
              <p className="text-indigo-300 font-sans font-semibold mb-1">Quick Login Cheatsheet:</p>
              <p><span className="text-slate-400">Customer:</span> customer@example.com</p>
              <p><span className="text-slate-400">Vendor 1:</span> vendor1@example.com</p>
              <p><span className="text-slate-400">Vendor 2:</span> vendor2@example.com</p>
              <p><span className="text-slate-400">Admin:</span> admin@example.com</p>
              <p className="text-amber-400 pt-1">Pass: password123</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NexStore Multi-Vendor E-Commerce Platform. Built with React, Node.js, Express, PostgreSQL & Prisma.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Vendor Agreement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
