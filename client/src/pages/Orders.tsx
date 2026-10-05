import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Order } from '../types/index.js';
import { api } from '../services/api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await api.getCustomerOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Orders & Package Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track packages across all vendors and download official tax invoices
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore our curated catalog and place your first multi-vendor order today!
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Order Header */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Placed</span>
                    <span className="text-xs font-bold text-slate-800">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Order ID</span>
                    <span className="text-xs font-mono font-bold text-indigo-600">{order.orderNumber}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                    <span className="text-xs font-extrabold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                    order.orderStatus === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : order.orderStatus === 'CANCELLED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    {order.orderStatus}
                  </span>

                  <Link
                    to={`/orders/${order.id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    View Details & Invoice <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Vendor Sub-Orders Summary */}
              <div className="p-6 space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contains {order.vendorOrders.length} Vendor Package(s):
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.vendorOrders.map((vo) => (
                    <div
                      key={vo.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" /> {vo.vendor.storeName}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 uppercase bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {vo.status}
                        </span>
                      </div>

                      {vo.trackingNumber && (
                        <p className="text-[11px] text-indigo-600 font-medium">
                          Tracking: <span className="font-mono font-bold">{vo.trackingNumber}</span> via {vo.shippingCarrier || 'Standard Delivery'}
                        </p>
                      )}

                      <div className="text-xs text-slate-600">
                        {vo.orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between py-1 border-t border-slate-200/50">
                            <span className="truncate max-w-[200px]">{item.title} (x{item.quantity})</span>
                            <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
