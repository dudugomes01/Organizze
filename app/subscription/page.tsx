import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { CheckIcon, XIcon, Sparkles, Zap, Infinity, Brain, FileText, Crown } from "lucide-react";
import AcquirePlanButton from "./_components/acquire-plan-button";
import { Badge } from "../_components/ui/badge";
import NavBar from "../_components/navBar";
import { getCurrentMonthTransactions } from "../_data/get-current-month-transactions";
import MobileBottomNav from '../(home)/_components/MobileBottomNav';
import { db } from "../_lib/prisma";

const SubscriptionPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  const user = await clerkClient().users.getUser(userId);
  const currentMonthTransactions = await getCurrentMonthTransactions();
  const investmentCategoriesCount = await db.investmentCategory.count({
    where: { userId },
  });
  const subscriptionsCount = await db.recurringSubscription.count({
    where: { userId },
  });
  const hasPremiumPlan = user.publicMetadata.subscriptionPlan == "premium";

  const basicFeatures = [
    { icon: CheckIcon, text: `Até 10 transações/mês`, highlight: `(${currentMonthTransactions}/10)`, available: true },
    { icon: CheckIcon, text: `Até 3 categorias de investimento`, highlight: `(${investmentCategoriesCount}/3)`, available: true },
    { icon: CheckIcon, text: `Até 3 assinaturas mensais`, highlight: `(${subscriptionsCount}/3)`, available: true },
    { icon: XIcon, text: "Importação OFX", available: false },
    { icon: XIcon, text: "Planejamento", available: false },
  ];

  const premiumFeatures = [
    { icon: Infinity, text: "Transações ilimitadas", available: true },
    { icon: Infinity, text: "Categorias de investimento ilimitadas", available: true },
    { icon: Infinity, text: "Assinaturas mensais", available: true },
    { icon: FileText, text: "Importação OFX", available: true },
    { icon: Zap, text: "Planejamento - Em Breve!", available: true },
  ];

  return (
    <>
      <NavBar />
      <div className="w-full bg-gradient-to-br from-[#000a1b] via-[#0a0f1f] to-[#000a1b] relative pb-32 sm:pb-8 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-[#55B02E]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[800px] sm:h-[800px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 w-full max-w-full">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 space-y-3 max-w-3xl mx-auto w-full px-2">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 flex-wrap">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[#55B02E]/30 blur-xl rounded-lg" />
                <div className="relative bg-gradient-to-br from-[#55B02E] to-emerald-600 p-1.5 rounded-lg">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white break-words">
                Escolha seu Plano
              </h1>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto px-2">
              Selecione o plano ideal para suas necessidades financeiras. 
              Gerencie seus gastos, invista com inteligência e tenha controle total.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="w-full max-w-5xl mx-auto px-2 sm:px-0">
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 items-start w-full">
              {/* Plano Básico */}
              <Card className="relative group w-full max-w-full sm:max-w-sm mx-auto lg:max-w-none">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                
                {/* Card */}
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-800/50 overflow-hidden flex flex-col">
                  <CardHeader className="py-4 sm:py-5 bg-gradient-to-b from-gray-800/50 to-gray-900/50 border-b border-gray-800/50">
                    <div className="text-center space-y-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Plano Básico
                      </h2>
                      <div className="flex items-end justify-center gap-1.5">
                        <span className="text-xl sm:text-2xl text-[#55B02E] font-bold">R$</span>
                        <span className="text-4xl sm:text-5xl font-extrabold text-white">0</span>
                        <span className="text-base sm:text-lg text-gray-400 mb-0.5">/mês</span>
                      </div>
                      <p className="text-xs text-gray-500 pt-1">Perfeito para começar</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col py-4 sm:py-5 px-4 sm:px-5 space-y-3">
                    {basicFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-colors ${
                            feature.available
                              ? "bg-gray-800/30"
                              : "bg-gray-800/20"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                            feature.available
                              ? "bg-[#55B02E]/20 text-[#55B02E]"
                              : "bg-red-500/40 text-red-400"
                          }`}>
                            <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                          </div>
                          <p className="text-white/90 text-sm flex-1">
                            {feature.text}
                            {feature.highlight && (
                              <span className="ml-2 text-[#55B02E] font-semibold">
                                {feature.highlight}
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    })}
                    
                    {!hasPremiumPlan && (
                      <div className="mt-auto pt-4">
                        <div className="w-full h-10 bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-700/50">
                          <span className="text-gray-400 text-xs sm:text-sm font-medium">
                            Plano Atual
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>

              {/* Plano Premium */}
              <Card className="relative group w-full max-w-full sm:max-w-sm mx-auto lg:max-w-none">
                {/* Premium Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#55B02E] via-emerald-500 to-[#55B02E] rounded-xl blur opacity-30 group-hover:opacity-40 animate-pulse" />
                
                {/* Card */}
                <div className="relative bg-gradient-to-br from-gray-900/90 via-emerald-950/20 to-gray-900/90 backdrop-blur-xl rounded-xl border-2 border-[#55B02E]/40 overflow-hidden flex flex-col shadow-2xl shadow-[#55B02E]/10">
                  {/* Premium Badge */}
                  {hasPremiumPlan && (
                    <div className="absolute top-3 right-3 z-20">
                      <Badge className="bg-[#55B02E]/20 hover:bg-[#55B02E]/20 text-white border border-[#55B02E] px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg shadow-[#55B02E]/30 pointer-events-none cursor-default">
                        <Sparkles className="w-3 h-3 mr-1 inline" />
                        Ativo
                      </Badge>
                    </div>
                  )}

                  {/* Floating Orb */}
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#55B02E]/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

                  <CardHeader className="relative py-4 sm:py-5 bg-gradient-to-b from-emerald-950/30 to-gray-900/50 border-b border-[#55B02E]/20 z-10">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#55B02E]" />
                        <h2 className="text-xl sm:text-2xl font-bold text-[#55B02E]">
                          Plano Premium
                        </h2>
                      </div>
                      <div className="flex items-end justify-center gap-1.5">
                        <span className="text-xl sm:text-2xl text-[#55B02E] font-bold">R$</span>
                        <span className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-[0_2px_20px_#55B02Eaa]">
                          17,90
                        </span>
                        <span className="text-base sm:text-lg text-gray-400 mb-0.5">/mês</span>
                      </div>
                      <p className="text-xs text-gray-400 pt-1">Máximo de recursos</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative flex-1 flex flex-col py-4 sm:py-5 px-4 sm:px-5 space-y-3 z-10">
                    {premiumFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-950/20 border border-[#55B02E]/10 group/feature hover:bg-emerald-950/30 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-[#55B02E]/30 text-[#55B02E] group-hover/feature:bg-[#55B02E]/40 transition-colors flex-shrink-0">
                            <Icon className="w-4 h-4 animate-pulse" />
                          </div>
                          <p className="text-white font-semibold text-sm flex-1">
                            {feature.text}
                          </p>
                        </div>
                      );
                    })}
                    
                    <div className="mt-auto pt-4">
                      <AcquirePlanButton />
                    </div>
                  </CardContent>

                  {/* Bottom Accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#55B02E]/60 to-transparent" />
                </div>
              </Card>
            </div>

            {/* Comparison Section */}
            <div className="mt-8 sm:mt-10 max-w-4xl mx-auto w-full px-2 sm:px-0">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4 sm:p-6 w-full overflow-hidden">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 text-center">
                  Por que escolher o Premium?
                </h3>
                <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                    <Infinity className="w-8 h-8 text-[#55B02E] mx-auto mb-2" />
                    <p className="text-white font-semibold text-sm mb-1">Sem Limites</p>
                    <p className="text-gray-400 text-xs">Transações ilimitadas</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                    <Brain className="w-8 h-8 text-[#55B02E] mx-auto mb-2" />
                    <p className="text-white font-semibold text-sm mb-1">IA Avançada</p>
                    <p className="text-gray-400 text-xs">Insights inteligentes</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                    <FileText className="w-8 h-8 text-[#55B02E] mx-auto mb-2" />
                    <p className="text-white font-semibold text-sm mb-1">Importação</p>
                    <p className="text-gray-400 text-xs">OFX automático</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
};

export default SubscriptionPage;
