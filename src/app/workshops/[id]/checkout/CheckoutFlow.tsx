"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import OrdererInfoStep, { type OrdererInfo } from "@/components/checkout/steps/OrdererInfoStep";
import AttendeeStep, { type AttendeeData, type RegistrationField } from "@/components/checkout/steps/AttendeeStep";
import ExtraFieldsStep from "@/components/checkout/steps/ExtraFieldsStep";
import ConfirmStep from "@/components/checkout/steps/ConfirmStep";

interface Workshop {
  id: string;
  title: string;
  price: number;
  remCap: number;
}

interface Props {
  workshop: Workshop;
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

const STEPS = ["訂購人資訊", "參加人資訊", "課程額外欄位", "確認付款"];

export default function CheckoutFlow({ workshop }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [ordererInfo, setOrdererInfo] = useState<OrdererInfo>(defaultOrderer);
  const [attendees, setAttendees] = useState<AttendeeData[]>([{ name: "", email: "", phone: "", metadata: {} }]);
  const [orderFieldValues, setOrderFieldValues] = useState<Record<string, string>>({});
  const [allFields, setAllFields] = useState<RegistrationField[]>([]);
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/bff/v1/workshops/${workshop.id}/fields`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAllFields(json.data);
      })
      .catch(console.error)
      .finally(() => setFieldsLoaded(true));
  }, [workshop.id]);

  const orderFields = allFields.filter((f) => f.scope === "ORDER");
  const attendeeFields = allFields.filter((f) => f.scope === "ATTENDEE");
  const hasExtraFields = orderFields.length > 0;

  // If no extra fields, skip step 2 (index 2)
  const effectiveSteps = hasExtraFields ? STEPS : STEPS.filter((_, i) => i !== 2);
  const totalSteps = effectiveSteps.length;

  // Map logical step to display step
  function logicalStep(): number {
    if (!hasExtraFields && step >= 2) return step - 1;
    return step;
  }

  function goNext() {
    // Skip extra fields step if none
    if (step === 1 && !hasExtraFields) {
      setStep(3);
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    if (step === 3 && !hasExtraFields) {
      setStep(1);
    } else {
      setStep((s) => Math.max(s - 1, 0));
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit() {
    // Step 1: Create order
    const res = await fetch("/api/bff/v1/orders/workshop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId: workshop.id,
        contentType: "WORKSHOP",
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
        attendees,
        fieldValues: orderFieldValues,
      }),
    });

    const orderData = await res.json();
    if (!orderData.success) {
      alert(orderData.error || "建立訂單失敗，請稍後再試");
      return;
    }

    // Step 2: Initiate ECPay payment
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

    // Step 3: Auto-submit ECPay form
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

  const displayStep = logicalStep();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-5 py-10">
        {/* Back link */}
        <Link href={`/workshops/${workshop.id}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors w-fit">
          <ArrowLeft size={15} /> 返回工作坊頁面
        </Link>

        {/* Workshop name */}
        <div className="mb-8">
          <p className="text-xs text-gold/70 uppercase tracking-widest mb-1">報名結帳</p>
          <h1 className="text-2xl font-light">{workshop.title}</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-10" ref={formRef}>
          {effectiveSteps.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  i < displayStep ? "bg-gold text-black" :
                  i === displayStep ? "bg-gold/20 border border-gold text-gold" :
                  "bg-white/5 border border-white/10 text-gray-500"
                }`}>
                  {i < displayStep ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] whitespace-nowrap hidden sm:block ${i === displayStep ? "text-gold" : "text-gray-500"}`}>
                  {label}
                </span>
              </div>
              {i < effectiveSteps.length - 1 && (
                <div className={`h-px flex-1 mx-2 mb-4 transition-all ${i < displayStep ? "bg-gold/60" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step title */}
        <h2 className="text-lg font-light mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gold rounded" />
          {effectiveSteps[displayStep]}
        </h2>

        {/* Step content */}
        {step === 0 && (
          <OrdererInfoStep
            data={ordererInfo}
            onChange={setOrdererInfo}
            onNext={goNext}
          />
        )}
        {step === 1 && (
          <AttendeeStep
            attendees={attendees}
            onChange={setAttendees}
            attendeeFields={attendeeFields}
            maxSlots={workshop.remCap || 20}
            onNext={goNext}
            onBack={goBack}
            ordererInfo={ordererInfo}
          />
        )}
        {step === 2 && hasExtraFields && (
          <ExtraFieldsStep
            fields={orderFields}
            values={orderFieldValues}
            onChange={setOrderFieldValues}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 3 && (
          <ConfirmStep
            workshop={workshop}
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
