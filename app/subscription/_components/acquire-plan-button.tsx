"use client";

import { Button } from "@/app/_components/ui/button";
import { createStripeCheckout } from "../_actions/create-stripe-checkout";
import { createStripePortalLink } from "../_actions/create-stripe-portal-link";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Calendar } from "lucide-react";

interface AcquirePlanButtonProps {
  isCanceled?: boolean;
  cancelAt?: Date | null;
}

const AcquirePlanButton = ({ isCanceled = false, cancelAt = null }: AcquirePlanButtonProps) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  console.log("🔍 [AcquirePlanButton] Props recebidas:");
  console.log("   - isCanceled:", isCanceled);
  console.log("   - cancelAt:", cancelAt);
  console.log("   - hasPremiumPlan:", user?.publicMetadata.subscriptionPlan === "premium");

  const handleAcquirePlanClick = async () => {
    setLoading(true);
    try {
      const { sessionId } = await createStripeCheckout();
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe publishable key not found");
      }
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      );
      if (!stripe) {
        throw new Error("Stripe not found");
      }
      await stripe.redirectToCheckout({ sessionId });
    } catch {
      toast.error("Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleManagePlanClick = async () => {
    setLoading(true);
    try {
      const { url } = await createStripePortalLink();
      window.location.href = url;
    } catch {
      toast.error("Erro ao abrir portal de gerenciamento");
    } finally {
      setLoading(false);
    }
  };

  const hasPremiumPlan = user?.publicMetadata.subscriptionPlan == "premium";
  
  // Se for premium e a assinatura foi cancelada, mostrar mensagem de expiração
  if (hasPremiumPlan && isCanceled && cancelAt) {
    const daysRemaining = Math.ceil((cancelAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="space-y-3">
        <div className="w-full p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-yellow-500 font-semibold text-sm">
                Assinatura Cancelada
              </p>
              <p className="text-gray-300 text-xs leading-relaxed">
                Você ainda tem acesso premium por mais <strong className="text-white">{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</strong>.
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>Expira em {cancelAt.toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          className="w-full h-12 bg-gradient-to-r from-[#55B02E] to-emerald-600 hover:from-emerald-600 hover:to-[#55B02E] text-white font-semibold text-base rounded-xl shadow-lg shadow-[#55B02E]/20 hover:shadow-[#55B02E]/40 transition-all duration-300 transform hover:scale-[1.02]"
          onClick={handleAcquirePlanClick}
          disabled={loading}
        >
          {loading ? "Processando..." : "Renovar Assinatura"}
        </Button>
      </div>
    );
  }
  
  // Se for premium e a assinatura está ativa, mostrar botão de gerenciamento
  if (hasPremiumPlan) {
    return (
      <Button 
        className="w-full h-12 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold text-base rounded-xl border border-gray-600 transition-all duration-300"
        variant="outline"
        onClick={handleManagePlanClick}
        disabled={loading}
      >
        {loading ? "Carregando..." : "Gerenciar plano"}
      </Button>
    );
  }
  
  // Se não for premium, mostrar botão de aquisição
  return (
    <Button
      className="w-full h-12 bg-gradient-to-r from-[#55B02E] to-emerald-600 hover:from-emerald-600 hover:to-[#55B02E] text-white font-semibold text-base rounded-xl shadow-lg shadow-[#55B02E]/20 hover:shadow-[#55B02E]/40 transition-all duration-300 transform hover:scale-[1.02]"
      onClick={handleAcquirePlanClick}
      disabled={loading}
    >
      {loading ? "Processando..." : "Adquirir plano Premium"}
    </Button>
  );
};

export default AcquirePlanButton;