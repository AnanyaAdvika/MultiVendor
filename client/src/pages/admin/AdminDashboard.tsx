import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Store,
  Users,
  ShoppingBag,
  DollarSign,
  PlusCircle,
  Package,
  Layers,
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { api } from '../../services/api.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Create Category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAnalytics();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    try {
      setCreatingCat(true);
      await api.createCategory({
        name: catName,
        description: catDesc,
        image: catImage || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
      });
      success(`Category "${catName}" created!`);
      setCatName('');
      setCatDesc('');
      setCatImage('');
      setShowCategoryModal(false);
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to create category');
    } finally {
      setCreatingCat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-10 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white">Marketplace Command Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Global system revenue, multi-vendor commission earnings, and merchant governance
            </p>
          </div>

          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Gross Marketplace Sales
            </span>
            <p className="text-2xl font-black text-white">{formatCurrency(stats.totalSales || 0)}</p>
            <span className="text-[10px] text-slate-500">Total customer transaction volume</span>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" /> Platform Fee Revenue
            </span>
            <p className="text-2xl font-black text-amber-400">{formatCurrency(stats.totalCommission || 0)}</p>
            <span className="text-[10px] text-slate-500">5% flat merchant commission retained</span>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-indigo-400" /> Master Orders Placed
            </span>
            <p className="text-2xl font-black text-white">{stats.totalOrders || 0}</p>
            <span className="text-[10px] text-slate-500">Unified checkouts processed</span>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-teal-400" /> Registered Vendors
            </span>
            <p className="text-2xl font-black text-white">{stats.totalVendors || 0}</p>
            <span className="text-[10px] text-slate-500">Active approved merchants</span>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-400" /> Registered Customers
            </span>
            <p className="text-2xl font-black text-white">{stats.totalCustomers || 0}</p>
            <span className="text-[10px] text-slate-500">Active marketplace buyers</span>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-purple-400" /> Catalog Products
            </span>
            <p className="text-2xl font-black text-white">{stats.totalProducts || 0}</p>
            <span className="text-[10px] text-slate-500">Across {stats.totalCategories || 4} categories</span>
          </div>
        </div>

        {/* Recent Master Orders Across All Vendors */}
        <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <h3 className="text-sm font-bold text-white">Recent Global Platform Orders</h3>
            <span className="text-xs text-indigo-400 font-semibold">Live Feed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Participating Vendors</th>
                  <th className="py-2.5 px-4">Total Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {data.recentOrders?.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {ord.user?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {ord.vendorOrders?.map((vo: any) => vo.vendor?.storeName).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-white">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700">
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-slate-800 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-700 space-y-4">
              <h3 className="text-base font-bold text-white pb-2 border-b border-slate-700">
                Create New Catalog Category
              </h3>

              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Gaming & VR"
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Brief summary..."
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCat}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                  >
                    {creatingCat ? 'Saving...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
