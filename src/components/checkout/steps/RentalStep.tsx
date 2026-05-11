"use client";

import { ChevronRight, ChevronLeft, Guitar, Check } from "lucide-react";

interface Props {
  instrumentName: string;
  rentalPrice: number;
  rentalRequested: boolean;
  onChange: (requested: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function RentalStep({ instrumentName, rentalPrice, rentalRequested, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        此課程提供樂器租借服務，您可以選擇在上課期間向我們租借 {instrumentName}。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 不租借 */}
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border transition-all text-left ${
            !rentalRequested
              ? "border-gold/60 bg-gold/5"
              : "border-white/10 bg-white/2 hover:border-white/20"
          }`}
        >
          {!rentalRequested && (
            <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
              <Check size={10} className="text-black" />
            </span>
          )}
          <span className="text-sm font-medium text-white">自備樂器</span>
          <span className="text-xs text-gray-400 text-center">我有自己的 {instrumentName}，不需要租借</span>
          <span className="text-base font-light text-gray-300">NT$ 0</span>
        </button>

        {/* 租借 */}
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border transition-all text-left ${
            rentalRequested
              ? "border-gold/60 bg-gold/5"
              : "border-white/10 bg-white/2 hover:border-white/20"
          }`}
        >
          {rentalRequested && (
            <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
              <Check size={10} className="text-black" />
            </span>
          )}
          <Guitar size={20} className="text-gold" />
          <span className="text-sm font-medium text-white">租借 {instrumentName}</span>
          <span className="text-xs text-gray-400 text-center">向 ENDAW 租借樂器，課程期間使用</span>
          <span className="text-base font-light text-gold">+ NT$ {rentalPrice.toLocaleString()}</span>
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors"
        >
          <ChevronLeft size={15} /> 上一步
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-black rounded-xl font-medium hover:bg-gold/90 transition-colors text-sm"
        >
          下一步 <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
