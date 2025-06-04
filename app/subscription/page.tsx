import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import AcquirePlanButton from "./_components/acquire-plan-button";
import { Badge } from "../_components/ui/badge";
import NavBar from "../_components/navBar";
import { getCurrentMonthTransactions } from "../_data/get-current-month-transactions";
import MobileBottomNav from '../(home)/_components/MobileBottomNav';


const SubscriptionPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  const user = await clerkClient().users.getUser(userId);
  const currentMonthTransactions = await getCurrentMonthTransactions();
  const hasPremiumPlan = user.publicMetadata.subscriptionPlan == "premium";
  return (
    <>
      <NavBar />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Assinatura</h1>

        <div className="block sm:flex gap-6 mb-[100px]">
          <Card className="w-full sm:w-[450px] rounded-[20px]">
            <CardHeader className="border-b border-solid py-8 bg-[#2f2f2f] rounded-[20px]">
              <h2 className="text-center text-2xl font-semibold">
                Plano Básico
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">R$</span>
                <span className="text-4xl font-semibold">0</span>
                <div className="text-2xl text-muted-foreground">/mês</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>
                  Apenas 10 transações por mês ({currentMonthTransactions}/10)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <XIcon className="text-[#fc0000]"/>
                <p>Relatórios de IA</p>
              </div>
              <div className="flex items-center gap-2">
                <XIcon className="text-[#fc0000]"/>
                <p>Planejamento</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-10 sm:mt-0 w-full sm:w-[450px] rounded-[20px] mb-[100px]">
            <CardHeader className="relative border-b border-solid py-8 bg-[#0b3a00] rounded-[20px]">
              {hasPremiumPlan && (
                <Badge className="block w-[51px] sm:absolute sm:left-4 sm:top-12 bg-primary/10 hover:bg-black text-[#4cff00] bg-[#000000] sm:inline-block">
                  Ativo
                </Badge>
              )}
              <h2 className="text-center text-2xl font-semibold">
                Plano Premium
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">R$</span>
                <span className="text-6xl font-semibold">19</span>
                <div className="text-2xl text-muted-foreground">/mês</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Transações ilimitadas</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Relatórios de IA</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Planejamento</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Transações ilimitadas</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Transações ilimitadas</p>
              </div>
              <AcquirePlanButton />
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
};

export default SubscriptionPage;