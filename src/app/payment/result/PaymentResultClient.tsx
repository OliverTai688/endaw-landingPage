'use client';

/**
 * PaymentResultClient.tsx
 *
 * Reads ECPay query params and shows a human-friendly payment result.
 * This component is display-only — it does NOT update the database.
 *
 * ECPay passes these params to OrderResultURL (client-facing redirect):
 *   - MerchantID, MerchantTradeNo, TradeNo, RtnCode, RtnMsg, PaymentDate, etc.
 *
 * IMPORTANT: The actual payment status is authoritative from the server callback.
 * The status displayed here is informational only and may differ if callback hasn't fired yet.
 */
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Info,
  Home,
  CreditCard,
} from 'lucide-react';

export default function PaymentResultClient() {
  const searchParams = useSearchParams();

  // ECPay result params
  const rtnCode = searchParams.get('RtnCode');
  const rtnMsg = searchParams.get('RtnMsg');
  const merchantTradeNo = searchParams.get('MerchantTradeNo');
  const tradeNo = searchParams.get('TradeNo');
  const paymentType = searchParams.get('PaymentType');
  const paymentDate = searchParams.get('PaymentDate');

  // Determine display state based on RtnCode
  // RtnCode "1" = success; anything else = failure or unknown
  const isSuccess = rtnCode === '1';
  const isPending = !rtnCode; // No params = direct page visit or callback not yet received

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full blur-[120px] ${
            isSuccess
              ? 'bg-emerald-500/5'
              : isPending
              ? 'bg-amber-500/5'
              : 'bg-red-500/5'
          }`}
        />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-16">
        {/* Status Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center border ${
              isSuccess
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : isPending
                ? 'bg-amber-500/10 border-amber-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 size={36} className="text-emerald-400" />
            ) : isPending ? (
              <Clock size={36} className="text-amber-400" />
            ) : (
              <XCircle size={36} className="text-red-400" />
            )}
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-light tracking-wide mb-2">
            {isSuccess
              ? '付款資訊已提交'
              : isPending
              ? '付款狀態確認中'
              : '付款未成功'}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isSuccess
              ? '您的付款資訊已送出，系統正在確認中。請稍待片刻。'
              : isPending
              ? '正在等待付款確認，請稍後查看訂單狀態。'
              : rtnMsg
              ? `付款未完成：${decodeURIComponent(rtnMsg)}`
              : '付款未完成，請返回重新嘗試。'}
          </p>
        </motion.div>

        {/* Important Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-start gap-3 px-4 py-3 mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl"
        >
          <Info size={15} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-300 leading-relaxed">
            <strong>重要提醒：</strong>
            此頁面僅供參考顯示用途。最終付款狀態由系統後台確認，以訂單管理頁面顯示的狀態為準。若付款成功，訂單狀態將於數分鐘內自動更新。
          </p>
        </motion.div>

        {/* Transaction Details (if available) */}
        {(merchantTradeNo || tradeNo || paymentType || paymentDate) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 backdrop-blur-md border border-white/8 rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                交易參考資訊
              </span>
            </div>
            <div className="space-y-2.5">
              {merchantTradeNo && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">訂單交易編號</span>
                  <span className="font-mono text-gray-300 text-xs">
                    {merchantTradeNo}
                  </span>
                </div>
              )}
              {tradeNo && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">綠界交易編號</span>
                  <span className="font-mono text-gray-300 text-xs">{tradeNo}</span>
                </div>
              )}
              {paymentType && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">付款方式</span>
                  <span className="text-gray-300 text-xs">{paymentType}</span>
                </div>
              )}
              {paymentDate && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">付款時間</span>
                  <span className="text-gray-300 text-xs">{paymentDate}</span>
                </div>
              )}
              {rtnCode && rtnCode !== '1' && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">回傳碼</span>
                  <span className="font-mono text-red-400 text-xs">{rtnCode}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <Link href="/" className="block">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-all cursor-pointer"
            >
              <Home size={15} />
              返回首頁
            </motion.div>
          </Link>

          {!isSuccess && merchantTradeNo && (
            <button
              id="result-back-btn"
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 rounded-xl text-sm text-amber-400 transition-all"
            >
              <ArrowLeft size={15} />
              返回重試
            </button>
          )}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-700 text-xs mt-8"
        >
          如有疑問請聯絡 ENDAW 客服 — staff@endaw.co
        </motion.p>
      </div>
    </div>
  );
}
