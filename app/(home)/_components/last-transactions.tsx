import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { TRANSACTION_PAYMENT_METHOD_ICONS } from "@/app/_constants/transactions";
import { formatCurrency } from "@/app/_utils/currency";
import { Transaction, TransactionType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface LastTransactionsProps {
  lastTransactions: Transaction[];
}

const LastTransactions = ({ lastTransactions }: LastTransactionsProps) => {
  const getAmountColor = (transaction: Transaction) => {
    if (transaction.type === TransactionType.EXPENSE) {
      return "text-red-500";
    }
    if (transaction.type === TransactionType.DEPOSIT) {
      return "text-primary";
    }
    return "text-white";
  };
  const getAmountPrefix = (transaction: Transaction) => {
    if (transaction.type === TransactionType.DEPOSIT) {
      return "+";
    }
    return "-";
  };
  return (
    <Card className="rounded-xl border bg-[#000f29] shadow-sm h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle className="font-bold text-white">Últimas Transações</CardTitle>
        <Button variant="outline" className="rounded-full font-bold text-xs border-[#55B02E] text-[#55B02E] hover:bg-[#55B02E]/10" asChild>
          <Link href="/transactions">Ver mais</Link>
        </Button>
      </CardHeader>
      <ScrollArea className="flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <CardContent className="space-y-4 pt-0">
          {lastTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma transação recente</p>
            </div>
          ) : (
            lastTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="rounded-lg bg-white/5 p-2.5 flex-shrink-0">
                    <Image
                      src={`/${TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]}`}
                      height={18}
                      width={18}
                      alt={transaction.paymentMethod}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {transaction.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-bold ml-3 flex-shrink-0 ${getAmountColor(transaction)}`}>
                  {getAmountPrefix(transaction)}
                  {formatCurrency(Number(transaction.amount))}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default LastTransactions;