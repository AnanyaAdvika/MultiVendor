import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { Order } from '../../types/index.js';
import { api } from '../../services/api.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await api.getAdminOrders();
        setOrders(data || []);
      } catch (err: any) {
        console.error('Failed to load admin orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-6xl">
        <div className="pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-black text-white">Global Marketplace Orders</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit master transactions and vendor sub-orders across all sellers
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-5">Order ID & Date</th>
                    <th className="py-3 px-5">Buyer</th>
                    <th className="py-3 px-5">Vendor Packages Split</th>
                    <th className="py-3 px-5">Total Amount</th>
                    <th className="py-3 px-5">Payment & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-700/30">
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-indigo-400 block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">{formatDateTime(ord.createdAt)}</span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-white block">{ord.user?.name}</span>
                        <span className="text-[10px] text-slate-400">{ord.user?.email}</span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          {ord.vendorOrders.map((vo) => (
                            <div key={vo.id} className="flex items-center gap-2 text-[11px] text-slate-300">
                              <span className="font-semibold text-white">• {vo.vendor.storeName}:</span>
                              <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-700">
                                {vo.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-5 font-black text-white text-sm">
                        {formatCurrency(ord.totalAmount)}
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-slate-300 font-semibold block">
                          {ord.paymentMethod} ({ord.paymentStatus})
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-900 border border-slate-700 text-indigo-300 mt-1 inline-block">
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
