"use client";

import { useState } from "react";
import { Building2, User, ChevronRight } from "lucide-react";

export interface OrdererInfo {
  orderMode: "B2C" | "B2B";
  name: string;
  email: string;
  phone: string;
  companyName: string;
  taxId: string;
  companyAddress: string;
  invoiceType: "PERSONAL" | "COMPANY" | "DONATE";
  carruerType: "NONE" | "PHONE" | "CITIZEN";
  carruerNum: string;
  donationCode: string;
}

interface Props {
  data: OrdererInfo;
  onChange: (data: OrdererInfo) => void;
  onNext: () => void;
}

export default function OrdererInfoStep({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof OrdererInfo, string>>>({});

  const set = (key: keyof OrdererInfo, value: string) =>
    onChange({ ...data, [key]: value });

  function validate(): boolean {
    const e: Partial<Record<keyof OrdererInfo, string>> = {};
    if (!data.name.trim()) e.name = "請填寫姓名";
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = "請填寫正確 Email";
    if (!data.phone.trim()) e.phone = "請填寫電話";
    if (data.orderMode === "B2B") {
      if (!data.companyName.trim()) e.companyName = "請填寫公司名稱";
      if (!data.taxId.trim() || !/^\d{8}$/.test(data.taxId)) e.taxId = "統一編號需為 8 位數字";
      if (!data.companyAddress.trim()) e.companyAddress = "請填寫公司地址";
    }
    if (data.invoiceType === "PERSONAL") {
      if (data.carruerType === "PHONE" && !data.carruerNum.trim()) e.carruerNum = "請填寫手機載具";
      if (data.carruerType === "CITIZEN" && !data.carruerNum.trim()) e.carruerNum = "請填寫自然人憑證條碼";
    }
    if (data.invoiceType === "DONATE" && !data.donationCode.trim()) e.donationCode = "請填寫捐贈碼";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const inputCls = (key: keyof OrdererInfo) =>
    `w-full bg-black/50 border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/60 transition-colors ${
      errors[key] ? "border-red-500/60" : "border-white/10"
    }`;

  return (
    <div className="space-y-6">
      {/* B2B / B2C tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
        {(["B2C", "B2B"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange({ ...data, orderMode: mode })}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-light transition-all ${
              data.orderMode === mode
                ? "bg-gold text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {mode === "B2C" ? <User size={15} /> : <Building2 size={15} />}
            {mode === "B2C" ? "個人購買" : "企業購買"}
          </button>
        ))}
      </div>

      {/* Contact fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            {data.orderMode === "B2B" ? "聯絡人姓名" : "姓名"} <span className="text-red-400">*</span>
          </label>
          <input className={inputCls("name")} value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="王小明" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">電話 <span className="text-red-400">*</span></label>
          <input className={inputCls("phone")} value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0912345678" />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-400 mb-1.5">Email <span className="text-red-400">*</span></label>
          <input className={inputCls("email")} value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="example@email.com" type="email" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* B2B extra fields */}
      {data.orderMode === "B2B" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-white/5 rounded-xl p-4 bg-white/2">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">公司名稱 <span className="text-red-400">*</span></label>
            <input className={inputCls("companyName")} value={data.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="ENDAW 股份有限公司" />
            {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">統一編號 <span className="text-red-400">*</span></label>
            <input className={inputCls("taxId")} value={data.taxId} onChange={(e) => set("taxId", e.target.value)} placeholder="12345678" maxLength={8} />
            {errors.taxId && <p className="text-red-400 text-xs mt-1">{errors.taxId}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1.5">公司地址 <span className="text-red-400">*</span></label>
            <input className={inputCls("companyAddress")} value={data.companyAddress} onChange={(e) => set("companyAddress", e.target.value)} placeholder="台北市信義區..." />
            {errors.companyAddress && <p className="text-red-400 text-xs mt-1">{errors.companyAddress}</p>}
          </div>
        </div>
      )}

      {/* Invoice section */}
      <div>
        <p className="text-xs text-gray-400 mb-3">發票開立方式</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(data.orderMode === "B2B"
            ? [{ value: "COMPANY", label: "公司發票" }]
            : [
                { value: "PERSONAL", label: "個人發票" },
                { value: "DONATE", label: "捐贈發票" },
              ]
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...data, invoiceType: value as OrdererInfo["invoiceType"] })}
              className={`py-2 rounded-lg text-sm border transition-all ${
                data.invoiceType === value
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {data.invoiceType === "PERSONAL" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">載具類型（選填）</p>
            <div className="flex gap-2">
              {(["NONE", "PHONE", "CITIZEN"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ ...data, carruerType: t })}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    data.carruerType === t
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  {t === "NONE" ? "無載具" : t === "PHONE" ? "手機載具" : "自然人憑證"}
                </button>
              ))}
            </div>
            {data.carruerType !== "NONE" && (
              <div>
                <input
                  className={inputCls("carruerNum")}
                  value={data.carruerNum}
                  onChange={(e) => set("carruerNum", e.target.value)}
                  placeholder={data.carruerType === "PHONE" ? "/ABC+1234" : "自然人憑證條碼"}
                />
                {errors.carruerNum && <p className="text-red-400 text-xs mt-1">{errors.carruerNum}</p>}
              </div>
            )}
          </div>
        )}

        {data.invoiceType === "DONATE" && (
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">捐贈碼 <span className="text-red-400">*</span></label>
            <input className={inputCls("donationCode")} value={data.donationCode} onChange={(e) => set("donationCode", e.target.value)} placeholder="如 8585" />
            {errors.donationCode && <p className="text-red-400 text-xs mt-1">{errors.donationCode}</p>}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => validate() && onNext()}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold text-black rounded-xl font-medium hover:bg-gold/90 transition-colors"
      >
        下一步：填寫參加人資訊 <ChevronRight size={16} />
      </button>
    </div>
  );
}
