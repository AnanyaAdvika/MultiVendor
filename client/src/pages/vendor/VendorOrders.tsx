import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronDown,
  X,
} from 'lucide-react';
import { VendorSidebar } from '../../components/vendor/VendorSidebar.js';
import { VendorOrder } from '../../types/index.js';
import { api } from '../../services/api.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';

export function VendorOrders() {
  const [vendorOrders, setVendorOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Status update modal state
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [newStatus, setNewStatus] = useState('PROCESSING');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('BlueDart Express');
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getVendorOrders();
      setVendorOrders(data || []);
    } catch (err: any) {
      console.error('Failed to load vendor orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openStatusModal = (vo: VendorOrder) => {
    setSelectedOrder(vo);
    setNewStatus(vo.status === 'PENDING' ? 'PROCESSING' : vo.status === 'PROCESSING' ? 'SHIPPED' : 'DELIVERED');
    setTrackingNumber(vo.trackingNumber || `TRK-${Date.now().toString().slice(-6)}`);
    setShippingCarrier(vo.shippingCarrier || 'BlueDart Express');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      await api.updateVendorOrderStatus(selectedOrder.id, {
        status: newStatus,
        trackingNumber: newStatus === 'SHIPPED' || newStatus === 'DELIVERED' ? trackingNumber : undefined,
        shippingCarrier: newStatus === 'SHIPPED' || newStatus === 'DELIVERED' ? shippingCarrier : undefined,
      });

      success(`Order updated to ${newStatus}! Customer tracking notified.`);
      setSelectedOrder(null);
      await loadOrders();
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <VendorSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-6xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">Vendor Fulfillment Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store's sub-orders, assign tracking barcodes, and dispatch shipments
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : vendorOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No orders received yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Customer orders placed for your catalog items will appear here for fulfillment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {vendorOrders.map((vo) => (
              <div
                key={vo.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Header */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Master Order</span>
                      <span className="text-xs font-mono font-bold text-indigo-600">
                        {vo.order?.orderNumber}
                      </span>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                      <span className="text-xs font-bold text-slate-700">
                        {formatDateTime(vo.createdAt)}
                      </span>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Earnings</span>
                      <span className="text-xs font-extrabold text-emerald-700">
                        {formatCurrency(vo.vendorEarnings)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full ${
                      vo.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : vo.status === 'SHIPPED'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {vo.status}
                    </span>

                    {vo.status !== 'DELIVERED' && vo.status !== 'CANCELLED' && (
                      <button
                        onClick={() => openStatusModal(vo)}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        Update Status <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body: Items & Shipping destination */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left: Items list */}
                  <div className="md:col-span-8 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Ordered Items in this Package
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {vo.orderItems.map((item) => (
                        <div key={item.id} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">
                            {item.title} <span className="text-slate-400">(x{item.quantity})</span>
                          </span>
                          <span className="font-extrabold text-slate-900">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {vo.trackingNumber && (
                      <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-indigo-600" />
                        <span>Carrier: <strong>{vo.shippingCarrier}</strong> | Tracking ID: <strong className="font-mono">{vo.trackingNumber}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Right: Customer & Address */}
                  <div className="md:col-span-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
                    <h4 className="font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Shipping Destination
                    </h4>
                    <p className="font-bold text-slate-900">{vo.order?.address?.fullName || vo.order?.user?.name}</p>
                    <p className="text-slate-600">{vo.order?.address?.street}</p>
                    <p className="text-slate-600">{vo.order?.address?.city}, {vo.order?.address?.state} - {vo.order?.address?.postalCode}</p>
                    <p className="text-slate-500 pt-1">Phone: {vo.order?.address?.phone || vo.order?.user?.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Update Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Update Order Fulfillment Status
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800"
                  >
                    <option value="PROCESSING">PROCESSING (Packing order)</option>
                    <option value="SHIPPED">SHIPPED (Handed to courier)</option>
                    <option value="DELIVERED">DELIVERED (Completed)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                {(newStatus === 'SHIPPED' || newStatus === 'DELIVERED') && (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Shipping Carrier</label>
                      <input
                        type="text"
                        value={shippingCarrier}
                        onChange={(e) => setShippingCarrier(e.target.value)}
                        placeholder="e.g. BlueDart Express, Delhivery Green, FedEx"
                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Tracking Number / AWB</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. TRK-98124018"
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    {updating ? 'Updating...' : 'Save & Notify Buyer'}
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
