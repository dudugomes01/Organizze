"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { InfoIcon, AlertTriangleIcon } from "lucide-react";
import { getAllocationLimits } from "../_actions/manage-allocation";

interface AllocationLimitsProps {
  refreshTrigger?: number;
}

export default function AllocationLimitsCard({ refreshTrigger }: AllocationLimitsProps) {
  const [limits, setLimits] = useState({
    totalRealInvestments: 0,
    totalAllocated: 0,
    availableToAllocate: 0,
    allocationPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setLoading(true);
        const data = await getAllocationLimits();
        setLimits(data);
      } catch (error) {
        console.error("Erro ao buscar limites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalRealInvestments, totalAllocated, availableToAllocate, allocationPercentage } = limits;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <InfoIcon className="w-5 h-5 text-blue-400" />
          Limites de Alocação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-green-400 text-sm font-medium">Total Investido</div>
            <div className="text-white text-lg font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalRealInvestments)}
            </div>
          </div>

          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-blue-400 text-sm font-medium">Total Alocado</div>
            <div className="text-white text-lg font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalAllocated)}
            </div>
            <div className="text-blue-300 text-xs">
              ({allocationPercentage.toFixed(1)}% do total)
            </div>
          </div>

          <div className={`text-center p-3 rounded-lg border ${
            availableToAllocate > 0 
              ? "bg-yellow-500/10 border-yellow-500/20" 
              : "bg-gray-500/10 border-gray-500/20"
          }`}>
            <div className={`text-sm font-medium ${
              availableToAllocate > 0 ? "text-yellow-400" : "text-gray-400"
            }`}>
              Disponível
            </div>
            <div className="text-white text-lg font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(availableToAllocate)}
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progresso da Alocação</span>
            <span className="text-white">{allocationPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Alertas */}
        {totalRealInvestments === 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
            <div className="text-red-300 text-sm">
              Você não possui transações de investimento. Adicione transações do tipo &quot;Investimento&quot; primeiro.
            </div>
          </div>
        )}

        {allocationPercentage >= 100 && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <InfoIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
            <div className="text-green-300 text-sm">
              ✅ Todos os seus investimentos foram alocados nas categorias!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}