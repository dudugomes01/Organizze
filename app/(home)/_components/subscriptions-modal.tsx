import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { CreditCard, TrendingUp } from "lucide-react";
import { RecurringSubscription } from "@prisma/client";
import Link from "next/link";

interface ActiveSubscriptionsCardProps {
  subscriptions: RecurringSubscription[];
}

export default function ActiveSubscriptionsCard({ subscriptions }: ActiveSubscriptionsCardProps) {
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
      <Link href="/my-subscriptions">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Assinaturas Ativas
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Total e quantidade */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalMonthly.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeSubscriptions.length} ativas este mês
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Mensal</span>
              </div>
            </div>

            {/* Lista das assinaturas ativas */}
            {activeSubscriptions.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeSubscriptions.slice(0, 4).map((subscription) => (
                  <div 
                    key={subscription.id}
                    className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {subscription.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      R$ {Number(subscription.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
                {activeSubscriptions.length > 4 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{activeSubscriptions.length - 4} mais assinaturas
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Nenhuma assinatura ativa
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique para gerenciar
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}