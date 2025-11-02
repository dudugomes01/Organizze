"use client";

import { RecurringSubscription } from "@prisma/client";

interface SubscriptionsListMobileProps {
  subscriptions: RecurringSubscription[];
}

const SubscriptionsListMobile = ({ subscriptions }: SubscriptionsListMobileProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const SubscriptionIcon = ({ className = "" }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );

  if (subscriptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-4 mt-[50px]">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 space-y-4">
        <div className="text-gray-400 text-sm">Assinaturas Ativas (Mensal)</div>
        
        <div className="space-y-3">
          {subscriptions.map((subscription) => {
            const amount = Number(subscription.amount);
            
            return (
              <div key={subscription.id} className="flex flex-col space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-950/30">
                    <div className="w-6 h-6 text-purple-400">
                      <SubscriptionIcon className="w-full h-full" />
                    </div>
                  </div>
                  <span className="text-white">{subscription.name}</span>
                </div>
            
                <div className="flex items-center justify-end gap-3">
                  <span className="text-purple-400">
                    -{formatCurrency(amount)}
                  </span>
                  <div className="flex gap-1">
                    <span className="text-xs text-gray-500 bg-purple-900/20 px-2 py-1 rounded">
                      Recorrente
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between pt-3 border-t border-gray-800">
          <span className="text-gray-400">Total Assinaturas</span>
          <span className="text-purple-400">
            -{formatCurrency(subscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsListMobile;