import React from 'react';
import { Courier, Order } from '../../types/delivery';
import { OrderDeliveryChat } from './OrderDeliveryChat';

interface CourierContactModalProps {
  courier: Courier;
  order?: Order;
  onClose: () => void;
  onSendInstruction?: (note: string) => void;
}

export const CourierContactModal: React.FC<CourierContactModalProps> = ({
  courier,
  order,
  onClose,
}) => {
  if (order) {
    return (
      <OrderDeliveryChat
        order={order}
        courier={courier}
        variant="modal"
        onClose={onClose}
      />
    );
  }

  // Fallback fallback if no active order is passed
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-center">
        <h3 className="text-base font-bold text-slate-900">{courier.name}</h3>
        <p className="text-xs text-slate-500 font-mono">{courier.phone}</p>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
