"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import OrdererInfoStep, { type OrdererInfo } from "@/components/checkout/steps/OrdererInfoStep";
import AttendeeStep, { type AttendeeData, type RegistrationField } from "@/components/checkout/steps/AttendeeStep";
import RentalStep from "@/components/checkout/steps/RentalStep";
import ExtraFieldsStep from "@/components/checkout/steps/ExtraFieldsStep";
import ConfirmStep from "@/components/checkout/steps/ConfirmStep";

interface MusicPackageInfo {
  id: string;
  name: string;
  price: number;
  lessonCount: number;
  bonusLessons: number;
  validDuration: number;
  instrumentName: string;
  levelName: string;
  rentalAvailable: boolean;
  rentalPrice: number;
}

interface Props {
  pkg: MusicPackageInfo;
  instrument: string;
}

const defaultOrderer: OrdererInfo = {
  orderMode: "B2C",
  name: "",
  email: "",
  phone: "",
  companyName: "",
  taxId: "",
  companyAddress: "",
  invoiceType: "PERSONAL",
  carruerType: "NONE",
  carruerNum: "",
  donationCode: "",
};

// Internal step indices — some are conditionally skipped during navigation
// 0: orderer, 1: attendee, 2: rental, 3: extra fields, 4: confirm
const ALL_STEP_LABELS = ["訂購人資訊", "參加人資訊", "租借樂器", "課程額外欄位", "確認付款"];

export default function MusicCheckoutFlow({ pkg, instrument }: Props) {
  const [step, setStep] = useState(0);
  const [ordererInfo, setOrdererInfo] = useState<OrdererInfo>(defaultOrderer);
  const [attendees, setAttendees] = useState<AttendeeData[]>([{ name: "", email: "", phone: "", metadata: {} }]);
  const [rentalRequested, setRentalRequested] = useState(false);
  const [orderFieldValues, setOrderFieldValues] = useState<Record<string, string>>({});
  const [allFields, setAllFields] = useState<RegistrationField[]>([]);
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const hasRental = pkg.rentalAvailable && pkg.rentalPrice > 0;

  useEffect(() => {
    fetch(`/api/bff/v1/music-packages/${pkg.id}/fields`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setAllFields(json.data); })
      .catch(console.error)
      .finally(() => setFieldsLoaded(true));
  }, [pkg.id]);

  const orderFields = allFields.filter((f) => f.scope === "ORDER");
  const attendeeFields = allFields.filter((f) => f.scope === "ATTENDEE");
  const hasExtraFields = orderFields.length > 0;

  // Build the visible step list based on active conditions
  const effectiveSteps = ALL_STEP_LABELS.filter((_, i) => {
    if (i === 2) return hasRental;
    if (i === 3) return hasExtraFields;
    return true;
  });

  // Map internal step index → display index (position in effectiveSteps)
  function displayStep(): number {
    let display = step;
    if (!hasRental && step >= 2) display--;
    if (!hasExtraFields && step >= 3) display--;
    return display;
  }

  function scrollTop() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goNext() {
    setStep((s) => {
      let next = s + 1;
      if (next === 2 && !hasRental) next++;
      if (next === 3 && !hasExtraFields) next++;
      return next;
    });
    scrollTop();
  }

  function goBack() {
    setStep((s) => {
      let prev = s - 1;
      if (prev === 3 && !hasExtraFields) prev--;
      if (prev === 2 && !hasRental) prev--;
      return prev;
    });
    scrollTop();
  }

  const rentalAmount = hasRental && rentalRequested ? pkg.rentalPrice : 0;

  async function handleSubmit() {
    const res = await fetch("/api/bff/v1/orders/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: pkg.id,
        orderMode: ordererInfo.orderMode,
        name: ordererInfo.name,
        email: ordererInfo.email,
        phone: ordererInfo.phone,
        companyName: ordererInfo.companyName || undefined,
        taxId: ordererInfo.taxId || undefined,
        companyAddress: ordererInfo.companyAddress || undefined,
        invoiceType: ordererInfo.invoiceType,
        carruerType: ordererInfo.carruerType,
        carruerNum: ordererInfo.carruerNum || undefined,
        donationCode: ordererInfo.donationCode || undefined,
        rentalRequested,
        rentalAmount,
        attendees,
        fieldValues: orderFieldValues,
      }),
    });

    const orderData = await res.json();
    if (!orderData.success) {
      alert(orderData.error || "建立訂單失敗，請稍後再試");
      return;
    }

    const payRes = await fetch("/api/payments/ecpay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: orderData.orderId }),
    });

    const payData = await payRes.json();
    if (!payData.success) {
      alert(payData.error || "建立付款失敗，請稍後再試");
      return;
    }

    const container = document.createElement("div");
    container.innerHTML = payData.htmlForm;
    document.body.appendChild(container);
    const form = container.querySelector("form");
    if (form) form.submit();
  }

  if (!fieldsLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const currentDisplay = displayStep();
  const workshopInfo = {
    title: `${pkg.instrumentName} ${pkg.levelName} — ${pkg.name}`,
    price: pkg.price,
    rentalRequested,
    rentalAmount,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link href={`/music/${instrument}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors w-fit">
          <ArrowLeft size={15} /> 返回課程頁面
        </Link>

        <div className="mb-8">
          <p className="text-xs text-gold/70 uppercase tracking-widest mb-1">課程報名結帳</p>
          <h1 className="text-2xl font-light">{pkg.instrumentName} — {pkg.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {pkg.lessonCount + pkg.bonusLessons} 堂 · 有效期 {pkg.validDuration} 個月
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-10" ref={formRef}>
          {effectiveSteps.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  i < currentDisplay ? "bg-gold text-black" :
                  i === currentDisplay ? "bg-gold/20 border border-gold text-gold" :
                  "bg-white/5 border border-white/10 text-gray-500"
                }`}>
                  {i < currentDisplay ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] whitespace-nowrap hidden sm:block ${i === currentDisplay ? "text-gold" : "text-gray-500"}`}>
                  {label}
                </span>
              </div>
              {i < effectiveSteps.length - 1 && (
                <div className={`h-px flex-1 mx-2 mb-4 transition-all ${i < currentDisplay ? "bg-gold/60" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <h2 className="text-lg font-light mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gold rounded" />
          {effectiveSteps[currentDisplay]}
        </h2>

        {step === 0 && (
          <OrdererInfoStep data={ordererInfo} onChange={setOrdererInfo} onNext={goNext} />
        )}
        {step === 1 && (
          <AttendeeStep
            attendees={attendees}
            onChange={setAttendees}
            attendeeFields={attendeeFields}
            maxSlots={10}
            onNext={goNext}
            onBack={goBack}
            ordererInfo={ordererInfo}
          />
        )}
        {step === 2 && hasRental && (
          <RentalStep
            instrumentName={pkg.instrumentName}
            rentalPrice={pkg.rentalPrice}
            rentalRequested={rentalRequested}
            onChange={setRentalRequested}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 3 && hasExtraFields && (
          <ExtraFieldsStep
            fields={orderFields}
            values={orderFieldValues}
            onChange={setOrderFieldValues}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 4 && (
          <ConfirmStep
            workshop={workshopInfo}
            ordererInfo={ordererInfo}
            attendees={attendees}
            orderFieldValues={orderFieldValues}
            orderFields={orderFields}
            attendeeFields={attendeeFields}
            onBack={goBack}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
