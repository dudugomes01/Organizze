import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionPercentagePerType } from "./types";
import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

export const getDashboard = cache(async (month: string, year: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const accumulatedWhere = {
    userId,
    date: {
      lte: new Date(`${year}-${month}-31`),
    },
  };

  const currentMonthWhere = {
    userId,
    date: {
      gte: new Date(`${year}-${month}-01`),
      lte: new Date(`${year}-${month}-31`),
    },
  };

  // Paralelizar todas as queries ao banco de dados
  const [
    activeSubscriptions,
    accumulatedDepositsResult,
    totalInvestidoResult,
    accumulatedExpensesResult,
    depositsTotalResult,
    investmentsTotalResult,
    expensesTotalResult,
    totalExpensePerCategoryResult,
    lastTransactions,
  ] = await Promise.all([
    // Buscar assinaturas ativas
    db.recurringSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    }),
    // Accumulated deposits
    db.transaction.aggregate({
      where: { ...accumulatedWhere, type: "DEPOSIT" },
      _sum: { amount: true },
    }),
    // Accumulated investments
    db.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: "INVESTMENT",
        date: { lte: new Date(`${year}-${month}-31`) },
        userId: userId,
      },
    }),
    // Accumulated expenses
    db.transaction.aggregate({
      where: { ...accumulatedWhere, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    // Current month deposits
    db.transaction.aggregate({
      where: { ...currentMonthWhere, type: "DEPOSIT" },
      _sum: { amount: true },
    }),
    // Current month investments
    db.transaction.aggregate({
      where: { ...currentMonthWhere, type: "INVESTMENT" },
      _sum: { amount: true },
    }),
    // Current month expenses
    db.transaction.aggregate({
      where: { ...currentMonthWhere, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    // Expenses per category
    db.transaction.groupBy({
      by: ["category"],
      where: {
        ...currentMonthWhere,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
    }),
    // Last transactions
    db.transaction.findMany({
      where: currentMonthWhere,
      orderBy: { date: "desc" },
      take: 15,
    }),
  ]);

  const subscriptionsTotal = activeSubscriptions.reduce(
    (sum, sub) => sum + Number(sub.amount),
    0
  );

  const accumulatedDeposits = Number(accumulatedDepositsResult._sum?.amount ?? 0);
  const accumulatedInvestments = Number(totalInvestidoResult._sum.amount ?? 0);
  const accumulatedExpenses = Number(accumulatedExpensesResult._sum?.amount ?? 0) + subscriptionsTotal;
  const depositsTotal = Number(depositsTotalResult._sum?.amount ?? 0);
  const investmentsTotal = Number(investmentsTotalResult._sum?.amount ?? 0);
  const expensesTotal = Number(expensesTotalResult._sum?.amount ?? 0) + subscriptionsTotal;

  const rawBalance = accumulatedDeposits - accumulatedExpenses - accumulatedInvestments;
  const balance = rawBalance > 0 ? rawBalance : 0;

  const transactionsTotal = depositsTotal + investmentsTotal + expensesTotal;

  const typesPercentage: TransactionPercentagePerType = {
    DEPOSIT: Math.round(
      (Number(depositsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    EXPENSE: Math.round(
      (Number(expensesTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    INVESTMENT: Math.round(
      (Number(investmentsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
  };

  const totalExpensePerCategory: TotalExpensePerCategory[] = totalExpensePerCategoryResult.map((category) => ({
    category: category.category,
    totalAmount: Number(category._sum.amount),
    percentageOfTotal: Math.round(
      (Number(category._sum.amount) / Number(expensesTotal)) * 100,
    ),
  }));

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
});