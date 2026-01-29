"use client";

import { Transaction } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import TransactionTypeBadge from "../_components/type-badge";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
} from "@/app/_constants/transactions";
import EditTransactionButton from "../_components/edit-transaction-button";
import DeleteTransactionButton from "../_components/delete-transaction-button";
import { TrendingUp, TrendingDown, Calendar, CreditCard } from "lucide-react";

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    HOUSING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    TRANSPORTATION: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    FOOD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    ENTERTAINMENT: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    HEALTH: "bg-red-500/20 text-red-400 border-red-500/30",
    UTILITY: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    SALARY: "bg-green-500/20 text-green-400 border-green-500/30",
    EDUCATION: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    OTHER: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return colors[category] || colors.OTHER;
};

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row: { original: transaction } }) => {
      const isExpense = transaction.type === "EXPENSE";
      return (
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 p-2 rounded-lg ${
            isExpense 
              ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20' 
              : 'bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20'
          }`}>
            {isExpense ? (
              <TrendingDown className="w-4 h-4 text-red-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-green-400" />
            )}
          </div>
          <span className="font-medium text-white">{transaction.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row: { original: transaction } }) => (
      <TransactionTypeBadge transaction={transaction} />
    ),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row: { original: transaction } }) => (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(transaction.category)}`}>
        {TRANSACTION_CATEGORY_LABELS[transaction.category]}
      </span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Método",
    cell: ({ row: { original: transaction } }) => (
      <div className="flex items-center gap-2">
        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-300 text-sm">
          {TRANSACTION_PAYMENT_METHOD_LABELS[transaction.paymentMethod]}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row: { original: transaction } }) => {
      const formattedDate = new Date(transaction.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return (
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-300 text-sm capitalize">{formattedDate}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row: { original: transaction } }) => {
      const amount = Number(transaction.amount);
      const isExpense = transaction.type === "EXPENSE";
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);
      
      return (
        <span className={`font-bold text-base ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
          {isExpense ? '-' : '+'}{formatted}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Ações",
    cell: ({ row: { original: transaction } }) => {
      return (
        <div className="flex gap-1.5">
          <EditTransactionButton transaction={transaction} />
          <DeleteTransactionButton transactionId={transaction.id} />
        </div>
      );
    },
  },
];