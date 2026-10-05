import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, PlusCircle, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export function VendorSidebar() {
  const { user } = useAuth();

  const links = [
    { to: '/vendor/dashboard', icon: LayoutDashboard, label: 'Overview & Analytics' },
    { to: '/vendor/products', icon: Package, label: 'My Products' },
    { to: '/vendor/products/new', icon: PlusCircle, label: 'Add New Product' },
    { to: '/vendor/orders', icon: ShoppingBag, label: 'Vendor Orders' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="pb-4 mb-4 border-b border-slate-100">
          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Vendor Portal</p>
          <h2 className="text-base font-extrabold text-slate-900 truncate">
            {user?.vendor?.storeName || 'My Store'}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Trust Score: {user?.vendor?.trustScore || 85}%
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/vendor/dashboard' || link.to === '/vendor/products'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <NavLink
          to="/products"
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </NavLink>
      </div>
    </aside>
  );
}
