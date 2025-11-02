"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { EditIcon, TrashIcon, TrendingUpIcon } from "lucide-react";
import { updateInvestmentAllocation, deleteAllocation, getAllocationLimits } from "../_actions/manage-allocation";
import { deleteInvestmentCategory } from "../_actions/manage-investment-category";
import { toast } from "sonner";

interface InvestmentCategory {
  id: string;
  name: string;
  type: string;
  description?: string;
  color: string;
  allocations: Array<{
    id: string;
    amount: number;
    percentage: number;
    targetPercentage?: number;
  }>;
}

interface AllocationManagerProps {
  categories: InvestmentCategory[];
}

const TYPE_LABELS = {
  FIXED_INCOME: "Renda Fixa",
  REAL_ESTATE: "FIIs",
  STOCKS: "Ações",
  EMERGENCY_FUND: "Reserva",
  CRYPTO: "Crypto",
  CUSTOM: "Personalizado",
};

export default function AllocationManager({ categories }: AllocationManagerProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editTargetPercentage, setEditTargetPercentage] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxAvailable, setMaxAvailable] = useState(0);

  const handleEdit = async (categoryId: string, currentAmount: number, targetPercentage?: number) => {
    setEditingCategory(categoryId);
    setEditAmount(currentAmount.toString());
    setEditTargetPercentage(targetPercentage?.toString() || "");
    
    // Buscar o limite disponível para esta categoria
    try {
      const limits = await getAllocationLimits(categoryId);
      setMaxAvailable(limits.availableToAllocate + currentAmount); // Incluir o valor atual
    } catch (error) {
      console.error("Erro ao buscar limites:", error);
      setMaxAvailable(0);
    }
  };

  const handleSave = async () => {
    if (!editingCategory) return;

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Digite um valor válido");
      return;
    }

    const targetPercentage = editTargetPercentage ? parseFloat(editTargetPercentage) : undefined;
    if (targetPercentage && (isNaN(targetPercentage) || targetPercentage < 0 || targetPercentage > 100)) {
      toast.error("Digite uma porcentagem válida (0-100)");
      return;
    }

    setLoading(true);
    try {
      await updateInvestmentAllocation({
        categoryId: editingCategory,
        amount,
        targetPercentage,
      });
      
      toast.success("Alocação atualizada com sucesso!");
      setEditingCategory(null);
      
      // Recarregar a página para atualizar os dados
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar alocação";
      toast.error(errorMessage, {
        duration: 6000, // Mostrar por mais tempo para que o usuário possa ler
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string, hasAllocation: boolean) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    setLoading(true);
    try {
      if (hasAllocation) {
        await deleteAllocation(categoryId);
      }
      await deleteInvestmentCategory(categoryId);
      
      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir categoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const allocation = category.allocations[0];
        const amount = allocation?.amount || 0;
        const percentage = allocation?.percentage || 0;
        const targetPercentage = allocation?.targetPercentage;
        const isEditing = editingCategory === category.id;

        return (
          <Card key={category.id} className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <CardTitle className="text-white text-lg">{category.name}</CardTitle>
                    <Badge variant="black" className="text-xs mt-1">
                      {TYPE_LABELS[category.type as keyof typeof TYPE_LABELS] || category.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category.id, amount, targetPercentage)}
                    className="text-gray-300 hover:text-white hover:bg-white/20"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id, !!allocation)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Valor Alocado</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={maxAvailable}
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="0.00"
                    />
                    {maxAvailable > 0 && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">
                          Máximo disponível: {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(maxAvailable)}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditAmount(maxAvailable.toString())}
                          className="text-xs text-[#9600ff] hover:text-white hover:bg-[#9600ff] h-6 px-2"
                        >
                          Usar máximo
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-300">Meta de Percentual (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editTargetPercentage}
                      onChange={(e) => setEditTargetPercentage(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategory(null)}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-[#9600ff] to-[#7c3aed]"
                    >
                      {loading ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Valor Investido:</span>
                    <span className="text-white font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Percentual:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {percentage.toFixed(1)}%
                      </span>
                      {targetPercentage && (
                        <Badge 
                          variant={percentage >= targetPercentage ? "default" : "destructive"}
                          className="text-xs"
                        >
                          Meta: {targetPercentage}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {percentage > 0 && (
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r transition-all duration-500"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          background: `linear-gradient(to right, ${category.color}, ${category.color}cc)`,
                        }}
                      />
                    </div>
                  )}

                  {category.description && (
                    <p className="text-gray-400 text-sm">{category.description}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {categories.length === 0 && (
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardContent className="p-8 text-center">
            <TrendingUpIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Nenhuma categoria criada ainda</p>
            <p className="text-gray-500 text-sm">
              Crie suas primeiras categorias de investimento para começar a organizar sua carteira.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}