'use client';

/**
 * CheckoutClient.tsx
 *
 * Client component for the checkout page.
 * Handles the "前往付款" action:
 *   1. POSTs to /api/payments/ecpay/create
 *   2. Receives HTML form string (no secrets exposed)
 *   3. Injects into a hidden div and auto-submits to ECPay
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  User,
  Mail,
  ShoppingBag,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  customer: { name: string; email: string };
  productItems: OrderItem[];
  createdAt: string;
}

interface Props {
  order: OrderData;
}

const ORDER_TYPE_LABEL: Record<string, string> = {
  WORKSHOP: '工作坊',
  MUSIC: '音樂課程',
  PRODUCT: '實體商品',
};

export default function CheckoutClient({ order }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAlreadyPaid =
    order.paymentStatus === 'COMPLETED' || order.status === 'PAID';

  const handlePay = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/ecpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || '建立付款失敗，請稍後再試');
        setIsLoading(false);
        return;
      }

      // Inject the ECPay auto-submit form and trigger submission
      // The form targets ECPay's endpoint (not our domain)
      const container = document.createElement('div');
      container.innerHTML = data.htmlForm;
      document.body.appendChild(container);

      const form = container.querySelector('form');
      if (!form) {
        throw new Error('ECPay form not found in response');
      }

      // Auto-submit — browser will redirect to ECPay payment page
      form.submit();
      // Keep loader visible during redirect
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '發生未知錯誤';
      setError(msg);
      setIsLoading(false);
    }
  };

  const totalDisplay = order.totalAmount.toLocaleString();

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 mb-4">
            <CreditCard size={24} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-light tracking-wide mb-1">確認付款</h1>
          <p className="text-gray-500 text-sm">
            訂單編號：
            <span className="font-mono text-amber-400/80">{order.orderNumber}</span>
          </p>
        </motion.div>

        {/* Already paid state */}
        {isAlreadyPaid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
          >
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300">此訂單已完成付款。</p>
          </motion.div>
        )}

        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-zinc-900/50 backdrop-blur-md border border-white/8 rounded-2xl overflow-hidden mb-4"
        >
          {/* Order Type Badge */}
          <div className="px-6 pt-5 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                訂單類型
              </span>
              <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-lg font-medium">
                {ORDER_TYPE_LABEL[order.orderType] ?? order.orderType}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                訂購項目
              </span>
            </div>

            {order.productItems.length > 0 ? (
              <div className="space-y-2">
                {order.productItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">
                      {item.name}
                      <span className="text-gray-600 ml-2">×{item.quantity}</span>
                    </span>
                    <span className="text-sm text-gray-300 font-mono">
                      NT${(item.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {ORDER_TYPE_LABEL[order.orderType] ?? '課程/工作坊'} 訂單
              </p>
            )}
          </div>

          {/* Total */}
          <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
            <span className="text-sm text-gray-400">應付金額</span>
            <div className="text-right">
              <span className="text-xs text-gray-600 mr-1">{order.currency}</span>
              <span className="text-2xl font-mono font-bold text-amber-400">
                {totalDisplay}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Customer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-md border border-white/8 rounded-2xl p-5 mb-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <User size={14} className="text-gray-600 shrink-0" />
              {order.customer.name}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Mail size={14} className="text-gray-600 shrink-0" />
              {order.customer.email}
            </div>
          </div>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 px-4 py-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Pay Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <motion.button
            id="checkout-pay-btn"
            whileHover={!isAlreadyPaid && !isLoading ? { scale: 1.01 } : {}}
            whileTap={!isAlreadyPaid && !isLoading ? { scale: 0.99 } : {}}
            onClick={handlePay}
            disabled={isLoading || isAlreadyPaid}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-medium text-base transition-all duration-300 ${
              isAlreadyPaid
                ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                : isLoading
                ? 'bg-amber-400/50 text-black cursor-not-allowed'
                : 'bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-400/20'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                正在前往綠界付款頁...
              </>
            ) : isAlreadyPaid ? (
              <>
                <CheckCircle size={18} />
                此訂單已付款
              </>
            ) : (
              <>
                <CreditCard size={18} />
                前往付款 NT${totalDisplay}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Security note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 mt-5 text-gray-600 text-xs"
        >
          <Lock size={11} />
          <span>付款由綠界科技（ECPay）安全處理 — ENDAW 不儲存您的卡片資訊</span>
        </motion.div>
      </div>
    </div>
  );
}
