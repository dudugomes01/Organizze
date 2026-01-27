import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon, TrendingUp, FileText, PieChart, Shield, Sparkles } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const loginPage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }

  const features = [
    {
      icon: PieChart,
      title: "Controle Total",
      description: "Gerencie todos os seus gastos e receitas em um só lugar",
    },
    {
      icon: TrendingUp,
      title: "Investimentos",
      description: "Organize e acompanhe seus investimentos de forma inteligente",
    },
    {
      icon: FileText,
      title: "Importação OFX",
      description: "Importe automaticamente suas transações bancárias",
    },
    {
      icon: Shield,
      title: "Seguro e Privado",
      description: "Seus dados financeiros protegidos com criptografia",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#000a1b] via-[#0a0f1f] to-[#000a1b] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-[#55B02E]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Branding & Features */}
            <div className="space-y-8 lg:space-y-12">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#55B02E]/30 blur-xl rounded-lg" />
                  <div className="relative bg-gradient-to-br from-[#55B02E] to-emerald-600 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <Image
                  src={"/logo.svg"}
                  width={150}
                  height={34}
                  className="dark:invert"
                  alt="Organizze AI Logo"
                />
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Controle Financeiro
                  <span className="block bg-gradient-to-r from-[#55B02E] to-emerald-400 bg-clip-text text-transparent">
                    Inteligente
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl">
                  Gerencie suas finanças com inteligência artificial. 
                  Acompanhe gastos, organize investimentos e importe transações bancárias automaticamente.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="group p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-[#55B02E]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#55B02E]/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#55B02E]/20 to-emerald-600/20 group-hover:from-[#55B02E]/30 group-hover:to-emerald-600/30 transition-colors">
                          <Icon className="w-5 h-5 text-[#55B02E]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold text-white text-sm">
                            {feature.title}
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#55B02E] animate-pulse" />
                  <span className="text-sm text-gray-400">100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#55B02E] animate-pulse" />
                  <span className="text-sm text-gray-400">Criptografia End-to-End</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#55B02E] animate-pulse" />
                  <span className="text-sm text-gray-400">Sincronização em Tempo Real</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#55B02E] via-emerald-500 to-[#55B02E] rounded-2xl blur opacity-20 animate-pulse" />
                  
                  {/* Card */}
                  <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-8 sm:p-10 shadow-2xl">
                    {/* Card Header */}
                    <div className="text-center mb-8 space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Bem-vindo de volta
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Entre para continuar gerenciando suas finanças
                      </p>
                    </div>

                    {/* Login Button */}
                    <SignInButton mode="redirect">
                      <Button
                        className="w-full h-12 bg-gradient-to-r from-[#55B02E] to-emerald-600 hover:from-emerald-600 hover:to-[#55B02E] text-white font-semibold text-base rounded-xl shadow-lg shadow-[#55B02E]/20 hover:shadow-[#55B02E]/40 transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <LogInIcon className="mr-2 w-5 h-5" />
                        Entrar ou Criar Conta
                      </Button>
                    </SignInButton>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gray-900/80 px-2 text-gray-500">
                          Plataforma Segura
                        </span>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                        <Shield className="w-5 h-5 text-[#55B02E] mx-auto mb-1" />
                        <p className="text-xs text-gray-400">SSL</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                        <FileText className="w-5 h-5 text-[#55B02E] mx-auto mb-1" />
                        <p className="text-xs text-gray-400">OFX</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                        <TrendingUp className="w-5 h-5 text-[#55B02E] mx-auto mb-1" />
                        <p className="text-xs text-gray-400">IA</p>
                      </div>
                    </div>

                    {/* Footer Note */}
                    <p className="text-center text-xs text-gray-500 mt-6">
                      Ao continuar, você concorda com nossos{" "}
                      <a href="#" className="text-[#55B02E] hover:underline">
                        Termos de Serviço
                      </a>{" "}
                      e{" "}
                      <a href="#" className="text-[#55B02E] hover:underline">
                        Política de Privacidade
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements Animation */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 bg-gradient-to-br from-[#55B02E]/20 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute inset-4 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-xl animate-pulse delay-500" />
        </div>
      </div>

      <div className="absolute top-10 right-10 hidden lg:block">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-2xl animate-pulse delay-1000" />
        </div>
      </div>
    </div>
  );
};

export default loginPage;
