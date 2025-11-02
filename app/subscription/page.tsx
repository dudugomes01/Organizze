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
  <div className="min-h-screen h-full w-full bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#0b3a00] flex flex-col items-center py-8 px-2 pb-32 sm:pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#4cff00] via-[#00ffd0] to-[#00bfff] drop-shadow-lg mb-8 tracking-tight">
          Assinatura
        </h1>
  <div className="flex flex-col sm:flex-row gap-10 w-full max-w-5xl justify-center items-stretch mb-32 px-2 sm:px-0">
          {/* Plano Básico */}
          <Card className="w-full max-w-xs sm:w-[360px] h-[472px] mx-auto rounded-3xl shadow-xl bg-[#181c1f] bg-opacity-90 border border-white/20 hover:scale-[1.03] transition-transform duration-300">
            <CardHeader className="py-8 bg-gradient-to-b from-[#232526]/80 to-[#2f2f2f]/80 rounded-3xl border-b border-white/10">
              <h2 className="text-center text-2xl font-bold text-white tracking-wide mb-2">
                Plano Básico
              </h2>
              <div className="flex items-end justify-center gap-2">
                <span className="text-3xl text-[#4cff00] font-bold">R$</span>
                <span className="text-5xl font-extrabold text-white">0</span>
                <span className="text-xl text-gray-300 mb-1">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 py-8 px-4">
              <div className="flex items-center gap-3">
                <CheckIcon className="text-[#4cff00] w-6 h-6" />
                <p className="text-white/90 text-lg">
                  Até 10 transações/mês <span className="ml-1 text-[#4cff00] font-bold">({currentMonthTransactions}/10)</span>
                </p>
              </div>
              <div className="flex items-center gap-3 opacity-60">
                <XIcon className="text-[#fc0000] w-6 h-6"/>
                <p className="text-white/80 text-lg">Relatórios de IA</p>
              </div>
              <div className="flex items-center gap-3 opacity-60">
                <XIcon className="text-[#fc0000] w-6 h-6"/>
                <p className="text-white/80 text-lg">Planejamento</p>
              </div>
              <div className="flex items-center gap-3 opacity-60">
                <XIcon className="text-[#fc0000] w-6 h-6"/>
                <p className="text-white/80 text-lg">Importação OFX</p>
              </div>
            </CardContent>
          </Card>

          {/* Plano Premium */}
          <Card className="w-full max-w-xs sm:w-[420px] mx-auto rounded-3xl shadow-2xl border-2 border-[#4cff00]/40 bg-gradient-to-br from-[#0b3a00]/80 via-[#1a4d00]/80 to-[#00ffd0]/10 backdrop-blur-lg relative overflow-visible hover:scale-[1.05] transition-transform duration-300 mb-40">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4cff00]/20 rounded-full blur-2xl z-0 pointer-events-none" />
            <CardHeader className="relative py-8 bg-gradient-to-b from-[#0b3a00]/80 to-[#1a4d00]/80 rounded-3xl border-b border-white/10 z-10">
              {hasPremiumPlan && (
                <Badge className="absolute left-4 top-8 bg-[#4cff00]/20 text-[#4cff00] border border-[#4cff00] px-4 py-1 rounded-full text-base font-bold shadow-md">
                  Ativo
                </Badge>
              )}
              <h2 className="text-center text-2xl font-bold text-[#4cff00] tracking-wide mb-2">
                Plano Premium
              </h2>
              <div className="flex items-end justify-center gap-2">
                <span className="text-3xl text-[#4cff00] font-bold">R$</span>
                <span className="text-6xl font-extrabold text-white drop-shadow-[0_2px_10px_#4cff00aa]">19</span>
                <span className="text-xl text-gray-300 mb-1">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 py-8 px-4 z-10">
              <div className="flex items-center gap-3">
                <CheckIcon className="text-[#4cff00] w-6 h-6 animate-pulse" />
                <p className="text-white/90 text-lg font-semibold">Transações ilimitadas</p>
              </div>
              <div className="flex items-center gap-3">
                <CheckIcon className="text-[#4cff00] w-6 h-6 animate-pulse" />
                <p className="text-white/90 text-lg font-semibold">Relatórios de IA</p>
              </div>
              <div className="flex items-center gap-3">
                <CheckIcon className="text-[#4cff00] w-6 h-6 animate-pulse" />
                <p className="text-white/90 text-lg font-semibold">Planejamento</p>
              </div>
              <div className="flex items-center gap-3">
                <CheckIcon className="text-[#4cff00] w-6 h-6 animate-pulse" />
                <p className="text-white/90 text-lg font-semibold">Importação OFX</p>
              </div>
              <div className="flex justify-center mt-8">
                <AcquirePlanButton />
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-[#4cff00]/60 via-[#00ffd0]/40 to-transparent rounded-b-3xl" style={{ width: '290px', marginLeft: '5px' }} />
          </Card>
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
};

export default SubscriptionPage;