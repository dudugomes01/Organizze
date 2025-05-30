"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  { label: "outubro", value: { month: "10", year: "2024" } },
  { label: "novembro", value: { month: "11", year: "2024" } },
  { label: "dezembro", value: { month: "12", year: "2024" } },
  { label: "janeiro", value: { month: "01", year: "2025" } },
  { label: "fevereiro", value: { month: "02", year: "2025" } },
  { label: "março", value: { month: "03", year: "2025" } },
  { label: "abril", value: { month: "04", year: "2025" } },
  { label: "maio", value: { month: "05", year: "2025" } },
];

const TimeSelect = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? "01";
  const year = searchParams.get("year") ?? "2025";

  const getCurrentIndex = () => {
    return MONTHS.findIndex(
      (m) => m.value.month === month && m.value.year === year
    );
  };

  const handleMonthChange = (direction: 'next' | 'prev') => {
    const currentIndex = getCurrentIndex();
    let newIndex;
    
    if (direction === 'next' && currentIndex < MONTHS.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }

    const newMonth = MONTHS[newIndex];
    push(`/?month=${newMonth.value.month}&year=${newMonth.value.year}`);
  };

  const handleMonthSelect = (selectedMonth: typeof MONTHS[0]) => {
    push(`/?month=${selectedMonth.value.month}&year=${selectedMonth.value.year}`);
  };

  const currentIndex = getCurrentIndex();
  const prevMonth = currentIndex > 0 ? MONTHS[currentIndex - 1] : null;
  const nextMonth = currentIndex < MONTHS.length - 1 ? MONTHS[currentIndex + 1] : null;
  const currentMonth = MONTHS[currentIndex];

  return (
    <div className="w-full max-w-full sm:max-w-3xl mx-auto px-4 !p-0">
      <div className="bg-[#202123] rounded-full p-3">
        <div className="flex items-center justify-between gap-2 text-gray-400">
          <button
            onClick={() => handleMonthChange('prev')}
            disabled={currentIndex === 0}
            className="p-2 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-4 text-sm">
            {prevMonth && (
              <button
                onClick={() => handleMonthSelect(prevMonth)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {prevMonth.label}
              </button>
            )}
            
            <span className="bg-green-500 text-black px-4 sm:px-6 py-1 rounded-full">
              {currentMonth.label}
            </span>
            
            {nextMonth && (
              <button
                onClick={() => handleMonthSelect(nextMonth)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {nextMonth.label}
              </button>
            )}
          </div>
          
          <button
            onClick={() => handleMonthChange('next')}
            disabled={currentIndex === MONTHS.length - 1}
            className="p-2 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelect;
