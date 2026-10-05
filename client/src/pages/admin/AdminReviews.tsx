import React, { useEffect, useState } from 'react';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { api } from '../../services/api.js';
import { formatDate } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';

export function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminReviews();
      setReviews(data || []);
    } catch (err: any) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.deleteReview(id);
      success('Review removed from marketplace');
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      error(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-6xl">
        <div className="pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-black text-white">Review Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor product reviews and remove fraudulent or abusive comments
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/80 rounded-3xl border border-slate-700/80 p-8 space-y-4">
            <p className="text-xs text-slate-400">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-5 flex items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-xs">{rev.user?.name}</span>
                    <span className="text-[10px] text-slate-400">• {formatDate(rev.createdAt)}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold">
                      Product: {rev.product?.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
