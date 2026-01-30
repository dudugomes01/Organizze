import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Calendar, CreditCard } from "lucide-react";

const AdminSubscriptionStatusPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const user = await clerkClient().users.getUser(userId);
  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;
  const stripeSubscriptionId = user.privateMetadata.stripeSubscriptionId as string | undefined;
  const clerkPlan = user.publicMetadata.subscriptionPlan as string | undefined;

  let stripeSubscription: Stripe.Subscription | null = null;
  let stripeStatus: string = "Não encontrada";
  let currentPeriodEnd: Date | null = null;
  let cancelAtPeriodEnd: boolean = false;

  if (process.env.STRIPE_SECRET_KEY && stripeSubscriptionId) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });

    try {
      stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      stripeStatus = stripeSubscription.status;
      currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    } catch (error) {
      console.error("Erro ao buscar subscription:", error);
    }
  }

  const isClerkPremium = clerkPlan === "premium";
  const isStripeActive = stripeStatus === "active" || stripeStatus === "trialing";
  const isSync = isClerkPremium === isStripeActive;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000a1b] via-[#0a0f1f] to-[#000a1b] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Status da Assinatura</h1>
          <p className="text-gray-400">Painel administrativo de verificação</p>
        </div>

        {/* Status Geral */}
        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {isSync ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              Status de Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Clerk Status</span>
                <Badge variant={isClerkPremium ? "default" : "secondary"}>
                  {isClerkPremium ? "Premium" : "Básico"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Stripe Status</span>
                <Badge 
                  variant={isStripeActive ? "default" : "secondary"}
                  className={isStripeActive ? "bg-green-600" : ""}
                >
                  {stripeStatus}
                </Badge>
              </div>
              {!isSync && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-500 text-sm">
                    ⚠️ Dessincronia detectada! Clerk e Stripe não estão alinhados.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do Stripe */}
        {stripeSubscription && (
          <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="w-5 h-5" />
                Detalhes do Stripe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 text-sm">Customer ID</span>
                <code className="text-xs text-gray-400">{stripeCustomerId || "N/A"}</code>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 text-sm">Subscription ID</span>
                <code className="text-xs text-gray-400">{stripeSubscriptionId || "N/A"}</code>
              </div>
              {currentPeriodEnd && (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fim do Período
                  </span>
                  <span className="text-gray-400 text-sm">
                    {currentPeriodEnd.toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 text-sm">Cancelar ao Final?</span>
                <div className="flex items-center gap-2">
                  {cancelAtPeriodEnd ? (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-500 text-sm">Sim</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 text-sm">Não</span>
                    </>
                  )}
                </div>
              </div>
              {cancelAtPeriodEnd && currentPeriodEnd && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    ℹ️ Assinatura cancelada. O acesso premium será mantido até <strong>{currentPeriodEnd.toLocaleDateString("pt-BR")}</strong>.
                    Após essa data, o Stripe enviará o webhook <code className="bg-gray-800 px-1 py-0.5 rounded">customer.subscription.deleted</code> e o plano será alterado para básico.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Informações do Usuário */}
        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Informações do Clerk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300 text-sm">User ID</span>
              <code className="text-xs text-gray-400">{userId}</code>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300 text-sm">Email</span>
              <span className="text-gray-400 text-sm">
                {user.emailAddresses[0]?.emailAddress || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Explicação */}
        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-400 text-sm">
            <p>
              <strong className="text-white">1. Assinatura Ativa:</strong> Usuário tem acesso premium até o final do período pago.
            </p>
            <p>
              <strong className="text-white">2. Cancelamento:</strong> Quando cancelada, a flag <code className="bg-gray-800 px-1 py-0.5 rounded">cancel_at_period_end</code> é marcada como <code className="bg-gray-800 px-1 py-0.5 rounded">true</code>.
            </p>
            <p>
              <strong className="text-white">3. Expiração:</strong> No final do período, o Stripe envia o webhook <code className="bg-gray-800 px-1 py-0.5 rounded">customer.subscription.deleted</code>.
            </p>
            <p>
              <strong className="text-white">4. Remoção Automática:</strong> O webhook atualiza o Clerk, removendo o plano premium.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSubscriptionStatusPage;
