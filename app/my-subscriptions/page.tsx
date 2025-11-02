import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NavBar from "../_components/navBar";
import MobileBottomNav from "../(home)/_components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "../_components/ui/card";
import CreateSubscriptionDialog from "./_components/create-subscription-dialog";
import SubscriptionsList from "./_components/subscriptions-list";
import { getRecurringSubscriptions } from "./_actions/manage-subscription/index";
import SejaPremiumMobile from "../_components/seja-premium-mobile";

export default async function MySubscriptionsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const subscriptions = await getRecurringSubscriptions();

  const totalMonthly = subscriptions
    .filter(sub => sub.isActive)
    .reduce((sum, sub) => sum + Number(sub.amount), 0);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:pb-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9600ff] to-[#7c3aed]">
              Minhas Assinaturas
            </h1>
            <p className="text-gray-400 text-lg">
              Gerencie suas assinaturas recorrentes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Total Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  R$ {totalMonthly.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Assinaturas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-400">
                  {subscriptions.filter(sub => sub.isActive).length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Total de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#9600ff]">
                  {subscriptions.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Add New Subscription */}
          <div className="flex justify-center">
            <CreateSubscriptionDialog />
          </div>

          {/* Subscriptions List */}
          <div className="space-y-4">
            <SubscriptionsList subscriptions={subscriptions} />
          </div>
        </div>
        
        <SejaPremiumMobile className="px-4 py-6 mb-20" />
      </div>
      <MobileBottomNav />
    </>
  );
}