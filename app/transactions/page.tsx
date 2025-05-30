
import { db } from "../_lib/prisma";
import { DataTable } from "../_components/ui/data-table";
import { transactionColumns } from "./_columns";
import AddTransactionButtonWrapper from "../_components/AddTransactionButtonWrapper";
import Navbar from "../_components/navBar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ScrollArea } from "../_components/ui/scroll-area";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import TransactionList from "./_columns/indexMobile";
import MobileBottomNav from '../(home)/_components/MobileBottomNav';

const TransactionsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const transactions = await db.transaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
  });

  const userCanAddTransaction = await canUserAddTransaction();

  const parsedTransactions = JSON.parse(JSON.stringify(transactions));

  return (
    <>
      <Navbar />
      <div className="flex flex-col space-y-6 p-6 overflow-hidden">
        {/* TÍTULO E BOTÃO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-center mt-10 mb-8">Extrato das Transações</h1>
          <div className="flex justify-center sm:justify-end">
            <AddTransactionButtonWrapper userCanAddTransaction={userCanAddTransaction} />
          </div>
        </div>

        {/* TABELA COM SCROLL HORIZONTAL */}
        <ScrollArea className="h-full overflow-x-auto">
          {/* Wrapper para mobile */}
          <div className="sm:hidden">
            <TransactionList transactions={parsedTransactions} />
          </div>

          {/* Wrapper para desktop */}
          <div className="hidden sm:block">
            <DataTable
              columns={transactionColumns}
              data={parsedTransactions}
            />
          </div>
        </ScrollArea>
      </div>
      <MobileBottomNav/>
    </>
  );
};

export default TransactionsPage;
