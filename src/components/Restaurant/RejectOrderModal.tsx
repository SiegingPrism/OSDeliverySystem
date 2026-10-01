import React, { useState } from 'react';
import { AlertCircle, Ban, Check, X } from 'lucide-react';
import { Order } from '../../types/delivery';

interface RejectOrderModalProps {
  order: Order;
  onClose: () => void;
  onConfirmReject: (orderId: string, reason: string) => void;
}

export const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  order,
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState('Kitchen currently at maximum capacity');
  const [customReason, setCustomReason] = useState('');

  const commonReasons = [
    'Kitchen currently at maximum capacity / Peak backlog',
    'Menu item(s) out of stock / 86\'d',
    'Customer address exceeds current delivery radius',
    'Kitchen closing soon / Preparation time unavailable',
  ];

  const handleReject = () => {
    const finalReason = customReason.trim() || reason;
    onConfirmReject(order.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5 text-rose-700">
            <Ban className="h-5 w-5" />
            <h3 className="text-sm font-bold text-slate-900">
              Reject Order {order.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Please select an operational reason for rejecting this order from{' '}
            <span className="font-semibold text-slate-900">{order.customerName}</span> (
            {order.items.length} items · ${order.total.toFixed(2)}). The customer will be
            notified immediately.
          </p>

          <div className="space-y-2">
            {commonReasons.map((r, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                  reason === r && !customReason
                    ? 'border-rose-300 bg-rose-50 text-rose-900 font-medium'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reject_reason"
                  checked={reason === r && !customReason}
                  onChange={() => {
                    setReason(r);
                    setCustomReason('');
                  }}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Or custom reason:
            </label>
            <input
              type="text"
              placeholder="e.g. Broken oven line, waiting for repair..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
