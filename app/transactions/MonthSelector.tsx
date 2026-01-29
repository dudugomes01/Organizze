"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

type Props = {
  selectedMonth: string;
};

export default function MonthSelector({ selectedMonth }: Props) {
  const now = new Date();
  const months = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: format(d, "yyyy-MM"),
      label: format(d, "MMMM 'de' yyyy", { locale: ptBR }),
    };
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", e.target.value);
    router.replace(`?${params.toString()}`);
  };

  // Capitalizar primeira letra
  const capitalizeMonth = (label: string) => {
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>
      <select
        name="month"
        value={selectedMonth}
        onChange={handleMonthChange}
        aria-label="Selecionar mês"
        className="w-full sm:w-auto appearance-none bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white border border-gray-700 hover:border-gray-600 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg hover:shadow-xl"
      >
        {months.map((m) => (
          <option 
            key={m.value} 
            value={m.value}
            className="bg-gray-900 text-white"
          >
            {capitalizeMonth(m.label)}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg 
          className="h-4 w-4 text-gray-400" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  );
}