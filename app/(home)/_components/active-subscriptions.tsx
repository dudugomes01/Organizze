import { Button } from "@/app/_components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { formatCurrency } from "@/app/_utils/currency";
import { RecurringSubscription } from "@prisma/client";
import { CreditCard } from "lucide-react";
import Link from "next/link";

interface ActiveSubscriptionsProps {
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

const ActiveSubscriptions = ({ subscriptions }: ActiveSubscriptionsProps) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);

  return (
    <ScrollArea className="rounded-md border" style={{ backgroundColor: '#000f29', borderRadius: '50px' }}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-bold">Assinaturas Ativas</CardTitle>
        <Button variant="outline" className="rounded-full font-bold" asChild>
          <Link href="/my-subscriptions">Ver mais</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeSubscriptions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Nenhuma assinatura ativa encontrada
            </p>
          </div>
        ) : (
          activeSubscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white bg-opacity-[3%] p-3 text-white">
                  <CreditCard
                    height={20}
                    width={20}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold">{subscription.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {PAYMENT_METHOD_LABELS[subscription.paymentMethod]}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-red-500">
                -{formatCurrency(Number(subscription.amount))}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </ScrollArea>
  );
};

export default ActiveSubscriptions;