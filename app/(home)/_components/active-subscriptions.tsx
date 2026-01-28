import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
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
    <Card className="rounded-xl border bg-[#000f29] shadow-sm h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle className="font-bold text-white">Assinaturas Ativas</CardTitle>
        <Button variant="outline" className="rounded-full font-bold text-xs border-[#55B02E] text-[#55B02E] hover:bg-[#55B02E]/10" asChild>
          <Link href="/my-subscriptions">Ver mais</Link>
        </Button>
      </CardHeader>
      <ScrollArea className="flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <CardContent className="space-y-4 pt-0">
          {activeSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma assinatura ativa encontrada</p>
            </div>
          ) : (
            activeSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="rounded-lg bg-white/5 p-2.5 flex-shrink-0">
                    <CreditCard
                      height={18}
                      width={18}
                      className="text-white"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {subscription.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[subscription.paymentMethod]}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-red-500 ml-3 flex-shrink-0">
                  -{formatCurrency(Number(subscription.amount))}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default ActiveSubscriptions;