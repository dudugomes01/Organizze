import { db } from "../_lib/prisma";
import { DataTable } from "../_components/ui/data-table";
import { transactionColumns } from "./_columns";
import { subscriptionColumns } from "./_columns/subscription-columns";
import AddTransactionButtonWrapper from "../_components/AddTransactionButtonWrapper";
import Navbar from "../_components/navBar";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ScrollArea } from "../_components/ui/scroll-area";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import TransactionList from "./_columns/indexMobile";
import MobileBottomNav from '../(home)/_components/MobileBottomNav';
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import MonthSelector from "./MonthSelector";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
// import { Badge } from "../_components/ui/badge";
// import { Separator } from "../_components/ui/separator";
import { TrendingUp, TrendingDown, Calendar, Repeat } from "lucide-react";
import SejaPremiumMobile from "../_components/seja-premium-mobile";
import SubscriptionsListMobile from "./_components/subscriptions-list-mobile";


type Props = {
  searchParams: {
    month?: string; // formato: 'YYYY-MM'
    search?: string;
    category?: string;
    type?: string;
  };
};

const TransactionsPage = async ({ searchParams }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  // Defina mês atual como padrão
  const now = new Date();
  const selectedMonth = searchParams?.month || format(now, "yyyy-MM");
  const [year, month] = selectedMonth.split("-");
  const startDate = startOfMonth(new Date(Number(year), Number(month) - 1));
  const endDate = endOfMonth(startDate);

  // Paralelizar queries ao banco de dados
  const [transactions, userCanAddTransaction, activeSubscriptions, user] = await Promise.all([
    db.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    }),
    canUserAddTransaction(),
    db.recurringSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    clerkClient().users.getUser(userId),
  ]);

  const userIsPremium = user.publicMetadata.subscriptionPlan === "premium";

  const parsedTransactions = JSON.parse(JSON.stringify(transactions));

  // Cálculos para o resumo
  const totalIncome = parsedTransactions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((t: any) => t.type === "DEPOSIT")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  
  const totalExpenses = parsedTransactions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((t: any) => t.type === "EXPENSE")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  
  // Adicionar o valor das assinaturas ativas às despesas
  const subscriptionsTotal = activeSubscriptions.reduce(
    (sum, sub) => sum + Number(sub.amount),
    0
  );
  
  const totalExpensesWithSubscriptions = totalExpenses + subscriptionsTotal;
  const balance = totalIncome - totalExpensesWithSubscriptions;
  const transactionCount = parsedTransactions.length;

  const monthName = format(startDate, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <>
      <Navbar />
      
      {/* Header com Gradiente */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 rounded-b-[20px]">
        <div className="container mx-auto px-4 py-8">
          {/* Título e Navegação */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="capitalize">{monthName}</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Extrato Financeiro
              </h1>
              <p className="text-muted-foreground">
                Gerencie e acompanhe suas transações financeiras
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <MonthSelector selectedMonth={selectedMonth} />
              <AddTransactionButtonWrapper userCanAddTransaction={userCanAddTransaction} userIsPremium={userIsPremium} />
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Receitas</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(totalIncome)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Despesas</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(totalExpensesWithSubscriptions)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Saldo</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(balance)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Transações</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {transactionCount}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">#</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8 ">
        {/* Barra de Ações */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ marginBottom: '0px' }}>
              <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Histórico de Transações</h2>
              
              </div>
            </div>
          </CardHeader>
    
        </Card>

        {/* Tabela de Transações */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {transactionCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma transação encontrada
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                  Não há transações registradas para {monthName.toLowerCase()}. 
                  Comece adicionando sua primeira transação.
                </p>
                <AddTransactionButtonWrapper 
                  userCanAddTransaction={userCanAddTransaction} 
                  userIsPremium={userIsPremium} 
                />
              </div>
            ) : (
              <ScrollArea className="h-full">
                {/* Mobile View */}
                <div className="sm:hidden">
                  {/* <SubscriptionsListMobile subscriptions={activeSubscriptions} /> */}
                  <TransactionList transactions={parsedTransactions} />
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block">
                  <DataTable
                    columns={transactionColumns}
                    data={parsedTransactions}
                  />
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Assinaturas Ativas */}
        {activeSubscriptions.length > 0 && (
          <>
            <Card className="border-0 shadow-lg mt-6">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ marginBottom: '0px' }}>
                  <div className="flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-purple-600" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Assinaturas Ativas
                    </h2>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <ScrollArea className="h-full">
                  <div className="hidden sm:block">
                    <DataTable
                      columns={subscriptionColumns}
                      data={activeSubscriptions}
                    />
                  </div>
                  <div className="sm:hidden">
                    <SubscriptionsListMobile subscriptions={activeSubscriptions} />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </>
        )}

        {/* Rodapé com Estatísticas Adicionais */}
        {/* {transactionCount > 0 && (
          <Card className="mt-6 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Última atualização: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Média por transação: {' '}
                    <span className="font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format((totalIncome + totalExpenses) / transactionCount)}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}
        
        <SejaPremiumMobile className="px-4 py-6 mb-20" />
      </div>

      <MobileBottomNav />
    </>
  );
};

export default TransactionsPage;


