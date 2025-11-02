import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionPercentagePerType } from "./types";
import { auth } from "@clerk/nextjs/server";

export const getDashboard = async (month: string, year: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Buscar assinaturas ativas
  const activeSubscriptions = await db.recurringSubscription.findMany({
    where: {
      userId,
      isActive: true,
    },
  });

  const subscriptionsTotal = activeSubscriptions.reduce(
    (sum, sub) => sum + Number(sub.amount),
    0
  );

  const accumulatedWhere = {
    userId,
    date: {
      lte: new Date(`${year}-${month}-31`),
    },
  };

  const accumulatedDeposits = Number(
    (
      await db.transaction.aggregate({
        where: { ...accumulatedWhere, type: "DEPOSIT" },
        _sum: { amount: true },
      })
    )?._sum?.amount ?? 0
  );

  const totalInvestido = await db.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "INVESTMENT",
      date: { lte: new Date(`${year}-${month}-31`) },
      userId: userId,
    },
  });

  const accumulatedInvestments = Number(totalInvestido._sum.amount ?? 0);

  const accumulatedExpenses = Number(
    (
      await db.transaction.aggregate({
        where: { ...accumulatedWhere, type: "EXPENSE" },
        _sum: { amount: true },
      })
    )?._sum?.amount ?? 0
  ) + subscriptionsTotal;

  const currentMonthWhere = {
    userId,
    date: {
      gte: new Date(`${year}-${month}-01`),
      lte: new Date(`${year}-${month}-31`),
    },
  };

  const depositsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...currentMonthWhere, type: "DEPOSIT" },
        _sum: { amount: true },
      })
    )?._sum?.amount ?? 0
  );

  const investmentsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...currentMonthWhere, type: "INVESTMENT" },
        _sum: { amount: true },
      })
    )?._sum?.amount ?? 0
  );

  const expensesTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...currentMonthWhere, type: "EXPENSE" },
        _sum: { amount: true },
      })
    )?._sum?.amount ?? 0
  ) + subscriptionsTotal;

   const rawBalance = accumulatedDeposits - accumulatedExpenses - accumulatedInvestments;
  const balance = rawBalance > 0 ? rawBalance : 0;
  // const balance = accumulatedDeposits - accumulatedExpenses - accumulatedInvestments;

  const transactionsTotal = depositsTotal + investmentsTotal + expensesTotal;

  const typesPercentage: TransactionPercentagePerType = {
    [TransactionType.DEPOSIT]: Math.round(
      (Number(depositsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.EXPENSE]: Math.round(
      (Number(expensesTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.INVESTMENT]: Math.round(
      (Number(investmentsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
  };

  const totalExpensePerCategory: TotalExpensePerCategory[] = (
    await db.transaction.groupBy({
      by: ["category"],
      where: {
        ...currentMonthWhere,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
    })
  ).map((category) => ({
    category: category.category,
    totalAmount: Number(category._sum.amount),
    percentageOfTotal: Math.round(
      (Number(category._sum.amount) / Number(expensesTotal)) * 100,
    ),
  }));

  const lastTransactions = await db.transaction.findMany({
    where: currentMonthWhere,
    orderBy: { date: "desc" },
    take: 15,
  });

  return {
    balance,
    depositsTotal,
    investmentsTotal, 
    accumulatedInvestments,
    expensesTotal,
    subscriptionsTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions: JSON.parse(JSON.stringify(lastTransactions)),
    activeSubscriptions: JSON.parse(JSON.stringify(activeSubscriptions)),
  };
};