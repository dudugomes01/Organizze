"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import { Trash2Icon, ToggleLeftIcon, ToggleRightIcon } from "lucide-react";
import { deleteRecurringSubscription, toggleSubscriptionStatus } from "../_actions/manage-subscription";
import { toast } from "sonner";
import { RecurringSubscription } from "@prisma/client";

interface SubscriptionsListProps {
  subscriptions: RecurringSubscription[];
}

const PAYMENT_METHOD_LABELS = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  BANK_TRANSFER: "Transferência",
  BANK_SLIP: "Boleto",
  CASH: "Dinheiro",
  OTHER: "Outros",
};

const CATEGORY_LABELS = {
  ENTERTAINMENT: "Entretenimento",
  UTILITY: "Utilidades",
  HEALTH: "Saúde",
  EDUCATION: "Educação",
  FOOD: "Alimentação",
  HOUSING: "Moradia",
  TRANSPORTATION: "Transporte",
  SALARY: "Salário",
  OTHER: "Outros",
};

export default function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta assinatura?")) return;
    
    setLoading(id);
    try {
      await deleteRecurringSubscription(id);
      toast.success("Assinatura excluída com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir assinatura");
    } finally {
      setLoading(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setLoading(id);
    try {
      await toggleSubscriptionStatus(id);
      toast.success("Status alterado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao alterar status");
    } finally {
      setLoading(null);
    }
  };

  if (subscriptions.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400 text-lg">Nenhuma assinatura cadastrada ainda</p>
          <p className="text-gray-500 text-sm mt-2">
            Adicione suas assinaturas recorrentes para controlar melhor seus gastos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold text-white mb-4">
        Suas Assinaturas ({subscriptions.length})
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => (
          <Card 
            key={subscription.id} 
            className={`${
              subscription.isActive 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-gray-800/30 border-gray-600 opacity-60"
            } transition-all duration-200 hover:scale-105`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white truncate">
                  {subscription.name}
                </h3>
                <Badge 
                  variant={subscription.isActive ? "default" : "secondary"}
                  className={
                    subscription.isActive 
                      ? "bg-green-600 text-white" 
                      : "bg-gray-600 text-gray-300"
                  }
                >
                  {subscription.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-2xl font-bold text-[#9600ff]">
                  R$ {Number(subscription.amount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">
                  {PAYMENT_METHOD_LABELS[subscription.paymentMethod]}
                </p>
                <p className="text-xs text-gray-500">
                  {CATEGORY_LABELS[subscription.category]}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(subscription.id)}
                  disabled={loading === subscription.id}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1"
                >
                  {subscription.isActive ? (
                    <ToggleRightIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ToggleLeftIcon className="w-4 h-4 mr-1" />
                  )}
                  {subscription.isActive ? "Pausar" : "Ativar"}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(subscription.id)}
                  disabled={loading === subscription.id}
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}