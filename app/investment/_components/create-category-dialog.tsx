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

export default function CreateCategoryDialog() {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#9600ff] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#9600ff] text-white font-semibold w-full sm:w-auto">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Criar Nova Categoria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Nome da Categoria</Label>
            <Input
              id="name"
              placeholder="Ex: Nubank, XP Investimentos..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="type" className="text-gray-300">Tipo de Investimento</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
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

          <div>
            <Label htmlFor="description" className="text-gray-300">Descrição (Opcional)</Label>
            <Input
              id="description"
              placeholder="Detalhes sobre este investimento..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300">Cor</Label>
            <div className="flex gap-2 mt-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? "border-white" : "border-gray-600"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
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
  );
}