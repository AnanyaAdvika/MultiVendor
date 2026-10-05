import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Users, ShoppingBag, MessageSquare, ArrowLeft, Shield } from 'lucide-react';

export function AdminSidebar() {
  const links = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Analytics Overview' },
    { to: '/admin/vendors', icon: Store, label: 'Vendors & Approvals' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'All Orders' },
    { to: '/admin/reviews', icon: MessageSquare, label: 'Review Moderation' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" /> Admin Center
          </div>
          <h2 className="text-base font-extrabold text-white mt-1">Platform Control</h2>
          <p className="text-[11px] text-slate-500">Full system oversight</p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <NavLink
          to="/products"
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Storefront
        </NavLink>
      </div>
    </aside>
  );
}
