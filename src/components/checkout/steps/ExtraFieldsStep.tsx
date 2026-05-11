"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { RegistrationField } from "./AttendeeStep";

interface Props {
  fields: RegistrationField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ExtraFieldsStep({ fields, values, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(id: string, value: string) {
    onChange({ ...values, [id]: value });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.id]?.trim()) e[f.id] = `${f.label} 為必填`;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const inputCls = (id: string) =>
    `w-full bg-black/50 border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/60 transition-colors ${
      errors[id] ? "border-red-500/60" : "border-white/10"
    }`;

  function renderField(field: RegistrationField) {
    const val = values[field.id] || "";
    switch (field.type) {
      case "TEXTAREA":
        return (
          <textarea
            className={`${inputCls(field.id)} resize-none`}
            rows={3}
            value={val}
            onChange={(e) => set(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case "SELECT":
        return (
          <select className={`${inputCls(field.id)} bg-black`} value={val} onChange={(e) => set(field.id, e.target.value)}>
            <option value="">請選擇</option>
            {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case "RADIO":
        return (
          <div className="flex flex-wrap gap-3">
            {field.options.map((o) => (
              <label key={o} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={field.id} value={o} checked={val === o} onChange={() => set(field.id, o)} className="accent-gold" />
                <span className="text-sm text-gray-300">{o}</span>
              </label>
            ))}
          </div>
        );
      case "CHECKBOX":
        return (
          <div className="flex flex-wrap gap-3">
            {field.options.map((o) => {
              const selected = val ? val.split(",") : [];
              const checked = selected.includes(o);
              return (
                <label key={o} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked ? selected.filter((x) => x !== o) : [...selected, o];
                      set(field.id, next.join(","));
                    }}
                    className="accent-gold"
                  />
                  <span className="text-sm text-gray-300">{o}</span>
                </label>
              );
            })}
          </div>
        );
      default:
        return (
          <input
            className={inputCls(field.id)}
            type={field.type === "DATE" ? "date" : "text"}
            value={val}
            onChange={(e) => set(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  }

  if (fields.length === 0) {
    // No extra fields — auto-advance
    return null;
  }

  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-xs text-gray-400 mb-1.5">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.id] && <p className="text-red-400 text-xs mt-1">{errors[field.id]}</p>}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">
          <ChevronLeft size={15} /> 上一步
        </button>
        <button type="button" onClick={() => validate() && onNext()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-black rounded-xl font-medium hover:bg-gold/90 transition-colors text-sm">
          下一步：確認付款資訊 <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
