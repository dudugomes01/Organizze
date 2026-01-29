"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/_components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { PlusIcon } from "lucide-react";
import { createInvestmentCategory } from "../_actions/manage-investment-category";
import { toast } from "sonner";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";

const INVESTMENT_TYPES = [
  { value: "FIXED_INCOME", label: "Renda Fixa (CDI, CDB, Tesouro)" },
  { value: "REAL_ESTATE", label: "Fundos Imobiliários" },
  { value: "STOCKS", label: "Ações" },
  { value: "EMERGENCY_FUND", label: "Reserva de Emergência" },
  { value: "CRYPTO", label: "Criptomoedas" },
  { value: "CUSTOM", label: "Personalizado" },
];

const COLORS = [
  "#9600ff", "#7c3aed", "#3b82f6", "#10b981", "#f59e0b", 
  "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"
];

interface CreateCategoryDialogProps {
  userCanCreateCategory: boolean;
}

export default function CreateCategoryDialog({ userCanCreateCategory }: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    color: "#9600ff",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      toast.error("Nome e tipo são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await createInvestmentCategory({
        name: formData.name,
        type: formData.type as "FIXED_INCOME" | "REAL_ESTATE" | "STOCKS" | "CUSTOM" | "EMERGENCY_FUND" | "CRYPTO",
        description: formData.description || undefined,
        color: formData.color,
      });
      
      toast.success("Categoria criada com sucesso!");
      setOpen(false);
      setFormData({ name: "", type: "", description: "", color: "#9600ff" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar categoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-[#9600ff] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#9600ff] text-white font-semibold w-full sm:w-auto"
                  disabled={!userCanCreateCategory}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              {!userCanCreateCategory &&
                "Você atingiu o limite de 3 categorias. Atualize seu plano para criar ilimitadas."}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      <DialogContent className="!mx-auto w-[calc(100vw-2rem)] max-w-sm sm:max-w-md bg-gray-900 border-gray-700 !left-1/2 !transform !-translate-x-1/2">
        <DialogHeader>
          <DialogTitle className="text-white">Criar Nova Categoria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="w-full">
            <Label htmlFor="name" className="text-gray-300">Nome da Categoria</Label>
            <Input
              id="name"
              placeholder="Ex: Nubank, XP Investimentos..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white w-full"
              maxLength={50}
            />
          </div>

          <div className="w-full">
            <Label htmlFor="type" className="text-gray-300">Tipo de Investimento</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {INVESTMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full">
            <Label htmlFor="description" className="text-gray-300">Descrição (Opcional)</Label>
            <Input
              id="description"
              placeholder="Detalhes sobre este investimento..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white w-full"
            />
          </div>

          <div className="w-full">
            <Label className="text-gray-300">Cor</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`${
                    formData.color === color 
                      ? "w-10 h-10 border-2 border-white shadow-lg transform scale-110" 
                      : "w-8 h-8 border-2 border-gray-600 hover:scale-105"
                  } rounded-full transition-all duration-200 ease-in-out`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#9600ff] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#9600ff]"
            >
              {loading ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    {!userCanCreateCategory && (
      <Link href="/subscription">
        <Button
          size="sm"
          className="bg-gradient-to-r from-[#55B02E] to-emerald-600 hover:from-emerald-600 hover:to-[#55B02E] text-white font-semibold text-xs px-3 py-1.5 shadow-lg shadow-[#55B02E]/30 hover:shadow-[#55B02E]/50 transition-all"
        >
          Seja premium
        </Button>
      </Link>
    )}
    </div>
  );
}
