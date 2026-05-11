"use client";

import { useState } from "react";
import { ChevronLeft, CreditCard, Check, Loader2, Building2, User } from "lucide-react";
import type { OrdererInfo } from "./OrdererInfoStep";
import type { AttendeeData, RegistrationField } from "./AttendeeStep";

interface Props {
  workshop: { title: string; price: number; rentalRequested?: boolean; rentalAmount?: number };
  ordererInfo: OrdererInfo;
  attendees: AttendeeData[];
  orderFieldValues: Record<string, string>;
  orderFields: RegistrationField[];
  attendeeFields: RegistrationField[];
  onBack: () => void;
  onSubmit: () => Promise<void>;
}

const INVOICE_TYPE_LABEL: Record<string, string> = {
  PERSONAL: "個人發票",
  COMPANY: "公司發票",
  DONATE: "捐贈發票",
};
const CARRUER_TYPE_LABEL: Record<string, string> = {
  NONE: "無載具",
  PHONE: "手機載具",
  CITIZEN: "自然人憑證",
};

export default function ConfirmStep({
  workshop,
  ordererInfo,
  attendees,
  orderFieldValues,
  orderFields,
  attendeeFields,
  onBack,
  onSubmit,
}: Props) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const qty = attendees.length;
  const subtotal = workshop.price * qty;
  const rentalAmount = workshop.rentalAmount ?? 0;
  const total = subtotal + rentalAmount;

  async function handlePay() {
    if (!agreed || loading) return;
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  }

  const rowCls = "flex justify-between text-sm py-2 border-b border-white/5";
  const labelCls = "text-gray-400";
  const valueCls = "text-gray-200 text-right";

  return (
    <div className="space-y-6">
      {/* Price summary */}
      <div className="bg-white/3 border border-white/8 rounded-xl p-5">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">費用明細</h3>
        <div className={rowCls}>
          <span className={labelCls}>{workshop.title}</span>
          <span className={valueCls}>NT$ {workshop.price.toLocaleString()} × {qty}</span>
        </div>
        {workshop.rentalRequested && rentalAmount > 0 && (
          <div className={rowCls}>
            <span className={labelCls}>租借樂器</span>
            <span className={valueCls}>NT$ {rentalAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between pt-3 mt-1">
          <span className="text-sm font-medium text-gray-300">合計</span>
          <span className="text-xl font-light text-gold">NT$ {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Orderer */}
      <div className="bg-white/3 border border-white/8 rounded-xl p-5">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          {ordererInfo.orderMode === "B2B" ? <Building2 size={12} /> : <User size={12} />}
          訂購人資訊（{ordererInfo.orderMode === "B2B" ? "企業" : "個人"}）
        </h3>
        <div className="space-y-1">
          <div className={rowCls}><span className={labelCls}>姓名</span><span className={valueCls}>{ordererInfo.name}</span></div>
          <div className={rowCls}><span className={labelCls}>Email</span><span className={valueCls}>{ordererInfo.email}</span></div>
          <div className={rowCls}><span className={labelCls}>電話</span><span className={valueCls}>{ordererInfo.phone}</span></div>
          {ordererInfo.orderMode === "B2B" && <>
            <div className={rowCls}><span className={labelCls}>公司</span><span className={valueCls}>{ordererInfo.companyName}</span></div>
            <div className={rowCls}><span className={labelCls}>統編</span><span className={valueCls}>{ordererInfo.taxId}</span></div>
          </>}
          <div className={rowCls}><span className={labelCls}>發票</span><span className={valueCls}>{INVOICE_TYPE_LABEL[ordererInfo.invoiceType]}</span></div>
          {ordererInfo.invoiceType === "PERSONAL" && ordererInfo.carruerType !== "NONE" && (
            <div className={rowCls}>
              <span className={labelCls}>{CARRUER_TYPE_LABEL[ordererInfo.carruerType]}</span>
              <span className={valueCls}>{ordererInfo.carruerNum}</span>
            </div>
          )}
          {ordererInfo.invoiceType === "DONATE" && (
            <div className={rowCls}><span className={labelCls}>捐贈碼</span><span className={valueCls}>{ordererInfo.donationCode}</span></div>
          )}
        </div>
      </div>

      {/* Order-level extra fields */}
      {orderFields.length > 0 && (
        <div className="bg-white/3 border border-white/8 rounded-xl p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">課程額外資訊</h3>
          <div className="space-y-1">
            {orderFields.map((f) => (
              <div key={f.id} className={rowCls}>
                <span className={labelCls}>{f.label}</span>
                <span className={valueCls}>{orderFieldValues[f.id] || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendees */}
      <div className="bg-white/3 border border-white/8 rounded-xl p-5">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">參加人資訊（{qty} 位）</h3>
        <div className="space-y-4">
          {attendees.map((a, i) => (
            <div key={i} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <p className="text-xs text-gold mb-2">參加人 {i + 1}</p>
              <div className="space-y-1">
                <div className={rowCls}><span className={labelCls}>姓名</span><span className={valueCls}>{a.name}</span></div>
                {a.phone && <div className={rowCls}><span className={labelCls}>電話</span><span className={valueCls}>{a.phone}</span></div>}
                {a.email && <div className={rowCls}><span className={labelCls}>Email</span><span className={valueCls}>{a.email}</span></div>}
                {attendeeFields.map((f) => a.metadata[f.id] ? (
                  <div key={f.id} className={rowCls}>
                    <span className={labelCls}>{f.label}</span>
                    <span className={valueCls}>{a.metadata[f.id]}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agree terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div
          onClick={() => setAgreed(!agreed)}
          className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
            agreed ? "bg-gold border-gold" : "border-white/20 bg-white/5"
          }`}
        >
          {agreed && <Check size={12} className="text-black" />}
        </div>
        <span className="text-xs text-gray-400 leading-relaxed">
          我已閱讀並同意工作坊相關規定、退費政策，以及個人資料保護聲明
        </span>
      </label>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={loading} className="flex items-center gap-2 px-5 py-3 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors disabled:opacity-40">
          <ChevronLeft size={15} /> 上一步
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={!agreed || loading}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gold text-black rounded-xl font-medium hover:bg-gold/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
          {loading ? "處理中..." : `前往付款 NT$ ${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
