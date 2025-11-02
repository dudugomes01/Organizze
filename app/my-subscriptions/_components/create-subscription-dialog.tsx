"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/_components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { PlusIcon } from "lucide-react";
import { createRecurringSubscription } from "../_actions/manage-subscription";
import { toast } from "sonner";
import { TransactionPaymentMethod } from "@prisma/client";

const PAYMENT_METHODS = [
  { value: "PIX", label: "PIX" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
  { value: "DEBIT_CARD", label: "Cartão de Débito" },
  { value: "BANK_TRANSFER", label: "Transferência Bancária" },
  { value: "BANK_SLIP", label: "Boleto" },
];



export default function CreateSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    paymentMethod: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.paymentMethod) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await createRecurringSubscription({
        name: formData.name,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod as TransactionPaymentMethod,
        startDate: new Date(),
      });
      
      toast.success("Assinatura criada com sucesso!");
      setOpen(false);
      setFormData({ name: "", amount: "", paymentMethod: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar assinatura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#9600ff] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#9600ff] text-white font-semibold px-8 py-3 text-lg">
          <PlusIcon className="w-5 h-5 mr-2" />
          Nova Assinatura
        </Button>
      </DialogTrigger>
      <DialogContent className="!mx-auto w-[calc(100vw-2rem)] max-w-sm sm:max-w-md bg-gray-900 border-gray-700 !left-1/2 !transform !-translate-x-1/2">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar Assinatura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="w-full">
            <Label htmlFor="name" className="text-gray-300">Nome do Serviço</Label>
            <Input
              id="name"
              placeholder="Ex: Netflix, Spotify, Amazon Prime..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white w-full"
              maxLength={50}
            />
          </div>

          <div className="w-full">
            <Label htmlFor="amount" className="text-gray-300">Valor Mensal (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ex: 29.90"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white w-full"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="paymentMethod" className="text-gray-300">Forma de Pagamento</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-full">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value} className="text-white hover:bg-gray-700">
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
  );
}