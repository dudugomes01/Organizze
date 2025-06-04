import { getDashboard } from "@/app/_data/get-dashboard";
import { PiggyBankIcon, TrendingUpIcon, CalendarIcon, DollarSignIcon } from "lucide-react";
import MobileBottomNav from '../(home)/_components/MobileBottomNav';

export default async function SettingsPage() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());

  const dashboard = await getDashboard(month, year);

  return (
    <main className="max-w-xl h-full mx-auto py-8 px-4 bg-gradient-to-b from-[#0b0014] via-[#1a0033] to-[#0b0014] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
          <div className="p-2 bg-gradient-to-r from-[#9600ff] to-[#7c3aed] rounded-xl shadow-lg">
            <PiggyBankIcon className="text-white w-6 h-6" />
          </div>
          Meus Investimentos
        </h1>
        <p className="text-gray-400 text-sm">Acompanhe seu progresso financeiro</p>
      </div>

      {/* Card Principal - Total Acumulado */}
      <div className="mb-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 border border-gray-100 transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="text-[#9600ff] w-5 h-5" />
            <span className="text-gray-600 font-medium">Total Investido</span>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        
        <div className="mb-2">
          <div className="text-4xl font-bold bg-gradient-to-r from-[#9600ff] to-[#7c3aed] bg-clip-text text-transparent">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(dashboard.accumulatedInvestments)}
          </div>
        </div>
        
        <p className="text-gray-500 text-sm">Patrimônio construído até hoje</p>
      </div>

      {/* Card Secundário - Mês Atual */}
      <div className="mb-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#9600ff]/20 rounded-lg">
            <CalendarIcon className="text-[#9600ff] w-4 h-4" />
          </div>
          <span className="text-gray-300 font-medium">Este Mês</span>
        </div>
        
        <div className="flex items-baseline gap-2 mb-2">
          <DollarSignIcon className="text-green-400 w-5 h-5" />
          <div className="text-2xl font-bold text-white">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(dashboard.investmentsTotal)}
          </div>
        </div>
        
        <p className="text-gray-400 text-sm">Valor investido em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Indicador Visual de Progresso */}
      <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium">Crescimento Mensal</span>
          <span className="text-green-400 text-sm font-semibold">+{((dashboard.investmentsTotal / dashboard.accumulatedInvestments) * 100).toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#9600ff] to-green-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min((dashboard.investmentsTotal / dashboard.accumulatedInvestments) * 100 * 10, 100)}%` }}
          ></div>
        </div>
        
        <p className="text-gray-400 text-xs mt-2">Continue investindo para alcançar seus objetivos</p>
      </div>

      {/* Footer motivacional */}
      <div className="text-center mb-20">
        <p className="text-gray-400 text-sm">
          💎 Cada real investido hoje é um passo rumo à sua liberdade financeira
        </p>
      </div>

      <MobileBottomNav/>
      

    </main>
  );
}