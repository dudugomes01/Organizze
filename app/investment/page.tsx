import { getDashboard } from "@/app/_data/get-dashboard";
import { PiggyBankIcon, TrendingUpIcon, CalendarIcon, DollarSignIcon, SettingsIcon } from "lucide-react";
import Navbar from "../_components/navBar";
import MobileBottomNav from '../(home)/_components/MobileBottomNav';
import CreateCategoryDialog from './_components/create-category-dialog';
import CreateDefaultCategoriesButton from './_components/create-default-categories-button';
import AllocationManager from './_components/allocation-manager';
import AllocationSummary from './_components/allocation-summary';
import AllocationLimitsCard from './_components/allocation-limits-card';
import { getInvestmentCategories } from './_actions/manage-investment-category';
import { getAllocationsWithCategories } from './_actions/manage-allocation';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import SejaPremiumMobile from "../_components/seja-premium-mobile";

export default async function InvestmentPage() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());

  const [dashboard, categories, allocationsData] = await Promise.all([
    getDashboard(month, year),
    getInvestmentCategories(),
    getAllocationsWithCategories(),
  ]);

  const { allocations, totalAmount: totalAllocated } = allocationsData;

  return (
    <>
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <div className="min-h-screen bg-gradient-to-b from-[#0b0014] via-[#1a0033] to-[#0b0014]">
        <main className="max-w-6xl mx-auto py-8 px-4 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
              <div className="p-2 bg-gradient-to-r from-[#9600ff] to-[#7c3aed] rounded-xl shadow-lg">
                <PiggyBankIcon className="text-white w-6 h-6" />
              </div>
              Meus Investimentos
            </h1>
            <p className="text-gray-400 text-sm">Acompanhe e gerencie sua carteira de investimentos</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {categories.length === 0 && <CreateDefaultCategoriesButton />}
            <CreateCategoryDialog />
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Card Principal - Total Acumulado */}
        <Card className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-100 transform hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="text-[#9600ff] w-5 h-5" />
                <span className="text-gray-600 font-medium">Total Investido</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#9600ff] to-[#7c3aed] bg-clip-text text-transparent">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(dashboard.accumulatedInvestments)}
              </div>
            </div>
            <p className="text-gray-500 text-sm">Patrimônio construído até hoje</p>
          </CardContent>
        </Card>

        {/* Card Secundário - Mês Atual */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#9600ff]/20 rounded-lg">
                <CalendarIcon className="text-[#9600ff] w-4 h-4" />
              </div>
              <span className="text-gray-300 font-medium">Este Mês</span>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Card de Alocação */}
        <Card className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <SettingsIcon className="text-[#9600ff] w-5 h-5" />
              <span className="text-white font-medium">Alocação</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <div className="text-2xl font-bold text-white">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalAllocated)}
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              {dashboard.accumulatedInvestments > 0 
                ? `${((totalAllocated / dashboard.accumulatedInvestments) * 100).toFixed(1)}% alocado`
                : "Nenhum valor alocado"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo da Alocação */}
      {allocations.length > 0 && (
        <AllocationSummary
          totalAllocated={totalAllocated}
          totalInvested={dashboard.accumulatedInvestments}
          allocations={allocations.map(allocation => ({
            ...allocation,
            targetPercentage: allocation.targetPercentage ?? undefined,
          }))}
        />
      )}

      {/* Indicador Visual de Progresso */}
      {dashboard.investmentsTotal > 0 && dashboard.accumulatedInvestments > 0 && (
        <Card className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Crescimento Mensal</span>
              <span className="text-green-400 text-sm font-semibold">
                +{((dashboard.investmentsTotal / dashboard.accumulatedInvestments) * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#9600ff] to-green-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((dashboard.investmentsTotal / dashboard.accumulatedInvestments) * 100 * 10, 100)}%` }}
              />
            </div>
            
            <p className="text-gray-400 text-xs mt-2">Continue investindo para alcançar seus objetivos</p>
          </CardContent>
        </Card>
      )}

      {/* Card de Limites de Alocação */}
      <AllocationLimitsCard />

      {/* Gerenciador de Alocações */}
      <Card className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#9600ff]" />
            Gerenciar Alocações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AllocationManager 
            categories={categories.map(category => ({
              ...category,
              description: category.description ?? undefined,
              allocations: category.allocations.map(allocation => ({
                ...allocation,
                amount: Number(allocation.amount),
                percentage: Number(allocation.percentage),
                targetPercentage: allocation.targetPercentage ? Number(allocation.targetPercentage) : undefined,
              })),
            }))} 
          />
        </CardContent>
      </Card>

      {/* Footer motivacional */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          💎 Cada real investido hoje é um passo rumo à sua liberdade financeira
        </p>
      </div>

      <SejaPremiumMobile className="px-4 py-6 mb-20" />
        </main>
      </div>
      <MobileBottomNav />
    </>
  );
}