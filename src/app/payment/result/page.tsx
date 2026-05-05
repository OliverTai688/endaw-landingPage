/**
 * /payment/result
 *
 * Payment result page — display only, NEVER the source of truth.
 *
 * ECPay redirects the customer here after payment (via OrderResultURL).
 * The actual payment status is determined exclusively by the server callback
 * at /api/payments/ecpay/callback.
 *
 * This page reads ECPay query params for display purposes only.
 * It does NOT write to the database.
 */
import { Suspense } from 'react';
import PaymentResultClient from './PaymentResultClient';

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentResultClient />
    </Suspense>
  );
}

export function generateMetadata() {
  return {
    title: 'ENDAW — 付款結果',
    description: '付款資訊已提交，系統正在確認中',
  };
}
