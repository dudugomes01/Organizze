"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useEffect, useMemo } from "react";

// Função para gerar meses dinamicamente
const generateMonths = () => {
  const months: Array<{ label: string; value: { month: string; year: string }; fullLabel: string }> = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
  
  // Nomes dos meses em português
  const monthNames = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  // Gerar meses dos últimos 3 meses do ano anterior até 12 meses à frente
  const startYear = currentYear - 1;
  const startMonth = 10; // Outubro do ano anterior
  
  for (let year = startYear; year <= currentYear + 1; year++) {
    let start: number;
    let end: number;
    
    if (year === startYear) {
      // Ano anterior: apenas outubro, novembro, dezembro
      start = startMonth;
      end = 12;
    } else if (year === currentYear) {
      // Ano atual: do mês atual até dezembro
      start = 1;
      end = 12;
    } else {
      // Ano seguinte: janeiro até 6 meses à frente do mês atual
      start = 1;
      end = Math.min(currentMonth + 6, 12);
    }
    
    for (let month = start; month <= end; month++) {
      const monthIndex = month - 1;
      const monthStr = month.toString().padStart(2, "0");
      const yearStr = year.toString();
      
      months.push({
        label: monthNames[monthIndex],
        value: { month: monthStr, year: yearStr },
        fullLabel: `${monthNames[monthIndex]} ${yearStr}`
      });
    }
  }
  
  return months;
};

const MONTHS = generateMonths();

const TimeSelect = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  
  // Obter mês/ano atual ou usar o mês/ano atual do sistema
  const currentDate = useMemo(() => {
    const now = new Date();
    return {
      month: (now.getMonth() + 1).toString().padStart(2, "0"),
      year: now.getFullYear().toString()
    };
  }, []);

  // Sempre usar o mês atual como padrão se não houver parâmetros
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");
  
  // Se não há parâmetros na URL, redireciona para o mês atual
  useEffect(() => {
    if (!monthParam || !yearParam) {
      push(`/?month=${currentDate.month}&year=${currentDate.year}`, { scroll: false });
    }
  }, [monthParam, yearParam, currentDate.month, currentDate.year, push]);
  
  const month = monthParam || currentDate.month;
  const year = yearParam || currentDate.year;

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
  const currentMonth = currentIndex >= 0 ? MONTHS[currentIndex] : MONTHS[0];

  // Se o mês/ano não estiver na lista, redireciona para o mês atual
  useEffect(() => {
    if (currentIndex === -1) {
      push(`/?month=${currentDate.month}&year=${currentDate.year}`);
    }
  }, [month, year, currentIndex, push, currentDate]);

  // Se não encontrar o mês, mostra loading enquanto redireciona
  if (currentIndex === -1) {
    return (
      <div className="w-full max-w-full sm:max-w-3xl mx-auto px-4 !p-0">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 shadow-lg border border-gray-700">
          <div className="flex items-center justify-center text-gray-400 text-sm">
            <Calendar className="mr-2 animate-pulse" size={16} />
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  const isCurrentMonth = currentMonth.value.month === currentDate.month && 
                         currentMonth.value.year === currentDate.year;

  return (
    <div className="w-full max-w-full sm:max-w-xl mx-auto px-4 !p-0">
      <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 rounded-xl p-4 sm:p-3.5 shadow-xl border border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Botão Anterior */}
          <button
            onClick={() => handleMonthChange('prev')}
            disabled={currentIndex === 0}
            className="p-2 sm:p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-700/50 disabled:hover:text-gray-300 active:scale-95"
            aria-label="Mês anterior"
          >
            <ChevronLeft size={18} className="sm:w-4 sm:h-4" />
          </button>
          
          {/* Área Central - Meses */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center">
            {prevMonth && (
              <button
                onClick={() => handleMonthSelect(prevMonth)}
                className="hidden sm:block px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 active:scale-95"
              >
                {prevMonth.label}
              </button>
            )}
            
            {/* Mês Atual */}
            <div className="relative group">
              <div className={`px-4 sm:px-4 py-2 sm:py-2 rounded-lg font-semibold text-sm sm:text-sm transition-all duration-300 ${
                isCurrentMonth 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-105' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
              }`}>
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="sm:w-4 sm:h-4" />
                  <span className="capitalize">{currentMonth.fullLabel}</span>
                </div>
              </div>
              {isCurrentMonth && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border-2 border-gray-900"></div>
              )}
            </div>
            
            {nextMonth && (
              <button
                onClick={() => handleMonthSelect(nextMonth)}
                className="hidden sm:block px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 active:scale-95"
              >
                {nextMonth.label}
              </button>
            )}
          </div>
          
          {/* Botão Próximo */}
          <button
            onClick={() => handleMonthChange('next')}
            disabled={currentIndex === MONTHS.length - 1}
            className="p-2 sm:p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-700/50 disabled:hover:text-gray-300 active:scale-95"
            aria-label="Próximo mês"
          >
            <ChevronRight size={18} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelect;
