import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import { Order } from '../types/index.js';
import { api } from '../services/api.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { useToast } from '../context/ToastContext.js';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getOrderById(id);
        setOrder(data);
      } catch (err: any) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      await api.cancelOrder(order.id);
      success('Order cancelled successfully. Stock restored.');
      const updated = await api.getOrderById(order.id);
      setOrder(updated);
    } catch (err: any) {
      error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/orders" className="text-indigo-600 font-bold hover:underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/orders"
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>

        <div className="flex items-center gap-3">
          {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED' && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Tax Invoice
          </button>
        </div>
      </div>

      {/* Official Tax Invoice Printable Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 invoice-container">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                N
              </span>
              <span className="text-xl font-black text-slate-900">NexStore Marketplace</span>
            </div>
            <p className="text-xs text-slate-400">Electronic Multi-Vendor Tax Invoice</p>
            <p className="text-xs text-slate-500 mt-2 font-mono">Invoice Date: {formatDateTime(order.createdAt)}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Order Number</span>
            <span className="text-base font-mono font-black text-indigo-600">{order.orderNumber}</span>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
              Payment: {order.paymentMethod} ({order.paymentStatus})
            </div>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600 pb-6 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">Billed & Shipped To:</h4>
            <p className="font-bold text-slate-800">{order.address?.fullName || order.user?.name}</p>
            <p className="mt-0.5">{order.address?.street}</p>
            <p>{order.address?.city}, {order.address?.state} - {order.address?.postalCode}</p>
            <p className="mt-1 text-slate-400">Phone: {order.address?.phone || order.user?.phone}</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">Marketplace Information:</h4>
            <p className="font-semibold text-slate-800">NexStore Multi-Vendor Hub</p>
            <p>Indiranagar Tech Enclave, Bengaluru, 560038</p>
            <p>GSTIN: 29AABCN8942K1Z8</p>
            <p className="text-emerald-600 font-semibold mt-1">Multi-Vendor Order Automated Split</p>
          </div>
        </div>

        {/* SIGNATURE FEATURE 3: SEPARATE VENDOR SUB-ORDERS & ITEMS */}
        <div className="space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Vendor Packages Breakdown
          </h3>

          {order.vendorOrders.map((vo, idx) => (
            <div key={vo.id} className="border border-slate-200 rounded-2xl overflow-hidden">
              {/* Vendor Sub-order Title Bar */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Package {idx + 1}: {vo.vendor.storeName}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (Trust Score: {vo.vendor.trustScore}%)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {vo.trackingNumber && (
                    <span className="font-mono text-indigo-600 font-semibold">
                      Tracking: {vo.trackingNumber} ({vo.shippingCarrier || 'Express'})
                    </span>
                  )}
                  <span className={`px-2 py-0.5 font-bold rounded-md uppercase text-[10px] ${
                    vo.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {vo.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-5">Item Description</th>
                    <th className="py-2.5 px-5 text-right">Unit Price</th>
                    <th className="py-2.5 px-5 text-center">Qty</th>
                    <th className="py-2.5 px-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vo.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-5 font-medium text-slate-800">
                        {item.title}
                        {item.isEcoFriendly && (
                          <span className="ml-2 text-[10px] text-emerald-600 font-bold">🌿 Eco</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">{formatCurrency(item.price)}</td>
                      <td className="py-3 px-5 text-center font-bold">{item.quantity}</td>
                      <td className="py-3 px-5 text-right font-bold text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Invoice Summary Totals */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-bold text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Discount ({order.couponCode}):</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charges:</span>
              <span className="font-bold text-slate-900">
                {order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>Grand Total:</span>
              <span className="text-indigo-600 text-base">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer Notice */}
        <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 text-center space-y-1">
          <p>Thank you for shopping on NexStore Multi-Vendor Marketplace!</p>
          <p>For questions or support, contact the respective vendor or our 24/7 help desk.</p>
        </div>
      </div>
    </div>
  );
}
