import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NavBar from "../_components/navBar";
import MobileBottomNav from "../(home)/_components/MobileBottomNav";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import CreateSubscriptionDialog from "./_components/create-subscription-dialog";
import SubscriptionsList from "./_components/subscriptions-list";
import { getRecurringSubscriptions } from "./_actions/manage-subscription/index";
import SejaPremiumMobile from "../_components/seja-premium-mobile";
import { CreditCardIcon, TrendingUpIcon, CalendarIcon, DollarSignIcon } from "lucide-react";
import { canUserCreateSubscription } from "../_data/can-user-create-subscription";

export default async function MySubscriptionsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const [subscriptions, userCanCreateSubscription] = await Promise.all([
    getRecurringSubscriptions(),
    canUserCreateSubscription(),
  ]);

  const totalMonthly = subscriptions
    .filter(sub => sub.isActive)
    .reduce((sum, sub) => sum + Number(sub.amount), 0);

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive).length;

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-[#0b0014] via-[#1a0033] to-[#0b0014]">
        <main className="max-w-6xl mx-auto py-8 px-4 min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
                  <div className="p-2 bg-gradient-to-r from-[#9600ff] to-[#7c3aed] rounded-xl shadow-lg">
                    <CreditCardIcon className="text-white w-6 h-6" />
                  </div>
                  Minhas Assinaturas
                </h1>
                <p className="text-gray-400 text-sm">Gerencie suas assinaturas recorrentes</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <CreateSubscriptionDialog userCanCreateSubscription={userCanCreateSubscription} />
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Card Principal - Total Mensal */}
            <Card className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-100 transform hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSignIcon className="text-[#9600ff] w-5 h-5" />
                    <span className="text-gray-600 font-medium">Total Mensal</span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#9600ff] to-[#7c3aed] bg-clip-text text-transparent">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalMonthly)}
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Gasto total com assinaturas</p>
              </CardContent>
            </Card>

            {/* Card Secundário - Assinaturas Ativas */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#9600ff]/20 rounded-lg">
                    <TrendingUpIcon className="text-[#9600ff] w-4 h-4" />
                  </div>
                  <span className="text-gray-300 font-medium">Ativas</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-2xl font-bold text-white">
                    {activeSubscriptions}
                  </div>
                </div>
                <p className="text-gray-400 text-sm">Assinaturas em uso no momento</p>
              </CardContent>
            </Card>

            {/* Card de Total de Serviços */}
            <Card className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="text-[#9600ff] w-5 h-5" />
                  <span className="text-white font-medium">Total de Serviços</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <div className="text-2xl font-bold text-white">
                    {subscriptions.length}
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  {subscriptions.length === 1 ? "Serviço cadastrado" : "Serviços cadastrados"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-4 mb-8">
            <SubscriptionsList subscriptions={subscriptions} />
          </div>

          {/* Footer motivacional */}
          <div className="text-center mb-8">
            <p className="text-gray-400 text-sm">
              💳 Mantenha controle sobre seus gastos recorrentes
            </p>
          </div>

          <SejaPremiumMobile className="px-4 py-6 mb-20" />
        </main>
      </div>
      <MobileBottomNav />
    </>
  );
}
