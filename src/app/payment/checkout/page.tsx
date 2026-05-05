/**
 * /payment/checkout?orderId=xxx
 *
 * Customer-facing checkout page.
 * Flow:
 *   1. Server Component fetches order summary from DB (orderId from query param)
 *   2. Displays order details (items, amount, customer)
 *   3. "前往付款" button triggers client-side form auto-submit to ECPay
 *
 * Security: This page never handles HashKey/IV — all secrets stay in the API route.
 */
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import CheckoutClient from './CheckoutClient';

interface CheckoutPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-400 text-sm">缺少訂單 ID (Missing orderId)</p>
        </div>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      productItems: {
        include: { product: { select: { name: true, slug: true } } },
      },
    },
  });

  if (!order) notFound();

  // Serialize to plain object for client component
  const orderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    currency: order.currency,
    customer: {
      name: order.customer.name,
      email: order.customer.email,
    },
    productItems: order.productItems.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    createdAt: order.createdAt.toISOString(),
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutClient order={orderData} />
    </Suspense>
  );
}

export function generateMetadata() {
  return {
    title: 'ENDAW — 確認付款',
    description: '完成您的 ENDAW 訂單付款',
  };
}
