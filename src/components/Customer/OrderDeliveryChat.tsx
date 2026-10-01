import React, { useEffect, useRef, useState } from 'react';
import {
  Bike,
  Bot,
  Car,
  Check,
  CheckCheck,
  Clock,
  MessageSquare,
  Navigation,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Courier, Order } from '../../types/delivery';

interface OrderDeliveryChatProps {
  order: Order;
  courier?: Courier | null;
  variant?: 'card' | 'modal' | 'embedded';
  onClose?: () => void;
}

export const OrderDeliveryChat: React.FC<OrderDeliveryChatProps> = ({
  order,
  courier,
  variant = 'card',
  onClose,
}) => {
  const { sendOrderChatMessage, couriers } = useDelivery();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeCourier =
    courier || couriers.find((c) => c.id === order.courierId);

  const chatMessages = order.chatMessages || [];

  const quickPresets = [
    { label: '🔢 Gate code: #4491', text: 'Gate code is #4491, buzzer works' },
    { label: '🚪 Leave at doorstep', text: 'Please leave the order right by the front door' },
    { label: '🔔 Ring doorbell twice', text: 'Please ring the front doorbell twice upon delivery' },
    { label: '🏢 Front reception desk', text: 'You can leave the delivery at the front desk' },
    { label: '📞 Call when arriving', text: 'Please call my phone when you arrive outside' },
    { label: '🐕 Beware of dog', text: 'Heads up: friendly dog in the front yard' },
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    sendOrderChatMessage(order.id, text.trim(), 'customer', order.customerName || 'Customer');
    setInputText('');

    // Trigger brief typing indicator before simulated driver responds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const chatContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3.5 px-4 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-200 shadow-xs">
              {activeCourier
                ? activeCourier.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                : 'DR'}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900">
                {activeCourier ? activeCourier.name : 'Assigned Driver'}
              </h4>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="text-emerald-700 font-medium">Online</span>
              <span>·</span>
              <span className="capitalize">{activeCourier?.vehicleType || 'Courier'}</span>
              <span>·</span>
              <span>Usually replies in &lt;1 min</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowCallModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Call Masked Line"
          >
            <Phone className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Call</span>
          </button>

          {variant === 'modal' && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Thread Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] max-h-[340px] bg-slate-50/50">
        {/* Order Context Banner */}
        <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
          <p className="text-[11px] text-indigo-900 font-medium">
            💬 You are communicating directly with your driver for{' '}
            <span className="font-bold font-mono text-indigo-700">{order.id}</span>
          </p>
          <p className="text-[10px] text-indigo-600 mt-0.5">
            Share gate access codes, apartment numbers, or doorstep instructions.
          </p>
        </div>

        {chatMessages.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No messages yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Send a quick delivery note below to give your courier specific instructions.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isCustomer = msg.sender === 'customer';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                  <span>{isCustomer ? 'You' : msg.senderName}</span>
                  <span>·</span>
                  <span>{formatTimestamp(msg.timestamp)}</span>
                </div>

                <div
                  className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed max-w-[85%] shadow-xs break-words ${
                    isCustomer
                      ? 'bg-indigo-600 text-white rounded-br-xs font-sans'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs font-sans'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
            <div className="flex space-x-1 items-center bg-white border border-slate-200 p-2 px-3 rounded-2xl shadow-xs">
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Driver is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Instruction Presets (1-tap click) */}
      <div className="p-2.5 px-4 border-t border-slate-100 bg-white">
        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
          Quick Delivery Instructions (Tap to Send)
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(preset.text)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-[11px] text-slate-700 transition-colors whitespace-nowrap active:scale-[0.98]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 px-4 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type delivery note (gate code, doorstep, etc)..."
            className="flex-1 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shadow-xs shrink-0"
            title="Send Message"
          >
            <Send className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* In-App Masked Carrier Line Dialog (No window.alert) */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs">
              <Phone className="h-6 w-6 animate-pulse" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Calling Driver: {activeCourier?.name || 'Assigned Courier'}
              </h4>
              <p className="font-mono text-sm text-indigo-700 font-bold mt-1">
                {activeCourier?.phone || '+1 (415) 555-0142'}
              </p>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                Connecting via carrier privacy bridge. Both your number and the driver's personal phone number remain anonymous.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCallModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setShowCallModal(false)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Connecting...
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          {chatContent}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {chatContent}
    </div>
  );
};
