"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { PieChartIcon, TrendingUpIcon, TargetIcon } from "lucide-react";

interface AllocationSummaryProps {
  totalAllocated: number;
  totalInvested: number;
  allocations: Array<{
    id: string;
    amount: number;
    percentage: number;
    targetPercentage?: number;
    investmentCategory: {
      name: string;
      color: string;
      type: string;
    };
  }>;
}

export default function AllocationSummary({ 
  totalAllocated, 
  totalInvested, 
  allocations 
}: AllocationSummaryProps) {
  const unallocatedAmount = totalInvested - totalAllocated;
  const unallocatedPercentage = totalInvested > 0 ? (unallocatedAmount / totalInvested) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Card de Resumo Geral */}
      <Card className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <PieChartIcon className="w-5 h-5 text-[#9600ff]" />
            Resumo da Carteira
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Investido:</span>
            <span className="font-bold text-lg text-gray-800">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalInvested)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Alocado:</span>
            <span className="font-bold text-lg text-green-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalAllocated)}
            </span>
          </div>

          {unallocatedAmount > 0 && (
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-yellow-700 font-medium">Não Alocado:</span>
              <span className="font-bold text-yellow-800">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(unallocatedAmount)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Distribuição */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUpIcon className="w-5 h-5 text-[#9600ff]" />
            Distribuição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allocations.map((allocation) => (
            <div key={allocation.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: allocation.investmentCategory.color }}
                />
                <span className="text-gray-300 text-sm">
                  {allocation.investmentCategory.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">
                  {allocation.percentage.toFixed(1)}%
                </span>
                {allocation.targetPercentage && (
                  <TargetIcon className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>
          ))}
          
          {unallocatedPercentage > 0 && (
            <div className="flex items-center justify-between border-t border-gray-700 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-gray-400 text-sm">Não Alocado</span>
              </div>
              <span className="text-gray-300 font-semibold">
                {unallocatedPercentage.toFixed(1)}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}