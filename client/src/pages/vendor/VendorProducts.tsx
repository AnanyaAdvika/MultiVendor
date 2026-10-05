import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Leaf, Sparkles, AlertCircle } from 'lucide-react';
import { VendorSidebar } from '../../components/vendor/VendorSidebar.js';
import { Product } from '../../types/index.js';
import { api } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';

export function VendorProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getVendorProducts();
      setProducts(data || []);
    } catch (err: any) {
      console.error('Failed to load vendor products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteVendorProduct(id);
      success('Product removed successfully');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      error(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <VendorSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-6xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Product Catalog</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage product pricing, discounts, stock levels, and multi-vendor deal groupings
            </p>
          </div>

          <Link
            to="/vendor/products/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Product
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">No products added yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start adding your products to appear on the marketplace catalog and best deal comparison engine.
            </p>
            <Link
              to="/vendor/products/new"
              className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700"
            >
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Product Details</th>
                    <th className="py-3 px-5">Category</th>
                    <th className="py-3 px-5">Price & Discount</th>
                    <th className="py-3 px-5">Stock Level</th>
                    <th className="py-3 px-5">Badges & Deals</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <img
                              src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              to={`/products/${p.slug}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 max-w-xs"
                            >
                              {p.title}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              SKU: {p.sku || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-medium text-slate-600">
                        {p.category.name}
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900">{formatCurrency(p.price)}</div>
                        {p.discountPercent > 0 && (
                          <span className="text-[10px] text-rose-600 font-bold">
                            {p.discountPercent}% OFF
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span className={`font-bold ${
                          p.stock <= 5 ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {p.stock} units
                        </span>
                        {p.stock <= 5 && (
                          <span className="block text-[10px] text-amber-500 font-medium">Low stock</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1 items-start">
                          {p.isEcoFriendly && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-1">
                              <Leaf className="w-3 h-3 text-emerald-600" /> Eco-Friendly
                            </span>
                          )}
                          {p.catalogGroup && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-600" /> Best Deal Variant
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/vendor/products/edit/${p.id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
