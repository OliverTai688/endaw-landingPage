"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronRight, ChevronLeft, Users, Copy } from "lucide-react";

export interface AttendeeData {
  name: string;
  email: string;
  phone: string;
  metadata: Record<string, string>;
}

export interface OrdererBasicInfo {
  name: string;
  email: string;
  phone: string;
}

export interface RegistrationField {
  id: string;
  label: string;
  type: "TEXT" | "TEXTAREA" | "SELECT" | "CHECKBOX" | "RADIO" | "DATE";
  required: boolean;
  options: string[];
  placeholder?: string;
  scope: "ORDER" | "ATTENDEE";
}

interface Props {
  attendees: AttendeeData[];
  onChange: (attendees: AttendeeData[]) => void;
  attendeeFields: RegistrationField[];
  maxSlots: number;
  onNext: () => void;
  onBack: () => void;
  ordererInfo?: OrdererBasicInfo;
}

const emptyAttendee = (): AttendeeData => ({ name: "", email: "", phone: "", metadata: {} });

export default function AttendeeStep({ attendees, onChange, attendeeFields, maxSlots, onNext, onBack, ordererInfo }: Props) {
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  function setAttendee(idx: number, patch: Partial<AttendeeData>) {
    const next = attendees.map((a, i) => (i === idx ? { ...a, ...patch } : a));
    onChange(next);
  }

  function setMeta(idx: number, fieldId: string, value: string) {
    const next = attendees.map((a, i) =>
      i === idx ? { ...a, metadata: { ...a.metadata, [fieldId]: value } } : a
    );
    onChange(next);
  }

  function addAttendee() {
    if (attendees.length < maxSlots) onChange([...attendees, emptyAttendee()]);
  }

  function removeAttendee(idx: number) {
    if (attendees.length > 1) onChange(attendees.filter((_, i) => i !== idx));
  }

  function validate(): boolean {
    const errs: Record<number, Record<string, string>> = {};
    attendees.forEach((a, i) => {
      const e: Record<string, string> = {};
      if (!a.name.trim()) e.name = "請填寫姓名";
      attendeeFields.forEach((f) => {
        if (f.required && !a.metadata[f.id]?.trim()) e[f.id] = `${f.label} 為必填`;
      });
      if (Object.keys(e).length) errs[i] = e;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const inputCls = (hasErr: boolean) =>
    `w-full bg-black/50 border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/60 transition-colors ${
      hasErr ? "border-red-500/60" : "border-white/10"
    }`;

  function renderField(field: RegistrationField, idx: number) {
    const val = attendees[idx].metadata[field.id] || "";
    const err = errors[idx]?.[field.id];
    switch (field.type) {
      case "TEXTAREA":
        return (
          <textarea
            className={`${inputCls(!!err)} resize-none`}
            rows={3}
            value={val}
            onChange={(e) => setMeta(idx, field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case "SELECT":
        return (
          <select
            className={`${inputCls(!!err)} bg-black`}
            value={val}
            onChange={(e) => setMeta(idx, field.id, e.target.value)}
          >
            <option value="">請選擇</option>
            {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case "RADIO":
        return (
          <div className="flex flex-wrap gap-3">
            {field.options.map((o) => (
              <label key={o} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`${idx}-${field.id}`} value={o} checked={val === o} onChange={() => setMeta(idx, field.id, o)} className="accent-gold" />
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
                      setMeta(idx, field.id, next.join(","));
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
            className={inputCls(!!err)}
            type={field.type === "DATE" ? "date" : "text"}
            value={val}
            onChange={(e) => setMeta(idx, field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users size={15} />
          <span>{attendees.length} 位參加人</span>
          {maxSlots > 1 && <span className="text-gray-600">（最多 {maxSlots} 位）</span>}
        </div>
        {attendees.length < maxSlots && (
          <button
            type="button"
            onClick={addAttendee}
            className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 border border-gold/30 hover:border-gold/60 px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus size={13} /> 新增參加人
          </button>
        )}
      </div>

      {attendees.map((a, idx) => (
        <div key={idx} className="border border-white/8 rounded-xl p-5 space-y-4 relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gold font-light">參加人 {idx + 1}</span>
            <div className="flex items-center gap-2">
              {ordererInfo && (
                <button
                  type="button"
                  onClick={() => setAttendee(idx, { name: ordererInfo.name, email: ordererInfo.email, phone: ordererInfo.phone })}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-2.5 py-1 rounded-lg transition-all"
                >
                  <Copy size={11} /> 同訂購人
                </button>
              )}
              {attendees.length > 1 && (
                <button type="button" onClick={() => removeAttendee(idx)} className="text-red-400/60 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">姓名 <span className="text-red-400">*</span></label>
              <input className={inputCls(!!errors[idx]?.name)} value={a.name} onChange={(e) => setAttendee(idx, { name: e.target.value })} placeholder="王小明" />
              {errors[idx]?.name && <p className="text-red-400 text-xs mt-1">{errors[idx].name}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">電話</label>
              <input className={inputCls(false)} value={a.phone} onChange={(e) => setAttendee(idx, { phone: e.target.value })} placeholder="0912345678" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <input className={inputCls(false)} type="email" value={a.email} onChange={(e) => setAttendee(idx, { email: e.target.value })} placeholder="example@email.com" />
            </div>
          </div>

          {attendeeFields.map((field) => (
            <div key={field.id}>
              <label className="block text-xs text-gray-400 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {renderField(field, idx)}
              {errors[idx]?.[field.id] && <p className="text-red-400 text-xs mt-1">{errors[idx][field.id]}</p>}
            </div>
          ))}
        </div>
      ))}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">
          <ChevronLeft size={15} /> 上一步
        </button>
        <button type="button" onClick={() => validate() && onNext()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-black rounded-xl font-medium hover:bg-gold/90 transition-colors text-sm">
          下一步 <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
