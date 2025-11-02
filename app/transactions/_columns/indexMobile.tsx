"use client";

import { Transaction } from "@prisma/client";
import EditTransactionButton from "../_components/edit-transaction-button";
import DeleteTransactionButton from "../_components/delete-transaction-button";
import { useMemo } from "react";


type GroupedTransactions = {
  [key: string]: {
    transactions: Transaction[];
    balance: number;
  };
};

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  const groupedTransactions = useMemo(() => {
    const grouped: GroupedTransactions = {};
    
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }).toLowerCase();
      
      if (!grouped[date]) {
        grouped[date] = {
          transactions: [],
          balance: 0
        };
      }
      
      grouped[date].transactions.push(transaction);
      const amount = Number(transaction.amount);
      grouped[date].balance += transaction.type === "EXPENSE" ? -amount : amount;
    });
    
    return grouped;
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(amount));
  };

  return (
    <div className="space-y-4 mb-[100px] mt-[35px]" >
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="text-center text-black py-10" style={{ backgroundColor: '#adff2f', borderRadius: '15px' }}>
          Não há nada cadastrado no mês selecionado!
        </div>
      ) : (
        Object.entries(groupedTransactions).map(([date, { transactions, balance }]) => (
          <div key={date} className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 space-y-4">
            <div className="text-gray-400 text-sm">{date}</div>
            
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const amount = Number(transaction.amount);
                const isExpense = transaction.type === "EXPENSE";
                
                return (
                  <div key={transaction.id} className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isExpense ? 'bg-red-950/30' : 'bg-green-950/30'}`}>
                        <div className={`w-6 h-6 ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
                          {isExpense ? (
                            <ExpenseIcon className="w-full h-full" />
                          ) : (
                            <DepositIcon className="w-full h-full" />
                          )}
                        </div>
                      </div>
                      <span className="text-white">{transaction.name}</span>
                    </div>
                
                      <div className="flex items-center justify-end gap-3">
                      <span className={isExpense ? 'text-red-500' : 'text-green-500'}>
                        {isExpense ? '-' : ''}{formatCurrency(amount)}
                      </span>
                      <div className="flex gap-1">
                        <EditTransactionButton transaction={transaction} />
                        <DeleteTransactionButton transactionId={transaction.id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between pt-3 border-t border-gray-800">
              <span className="text-gray-400">Balanço do dia</span>
              <span className={balance >= 0 ? 'text-green-500' : 'text-red-500'}>
                {balance >= 0 ? '' : '-'}{formatCurrency(balance)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
const DepositIcon = ({ className = "" }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" /> 
      <path d="M5 12h15" /> 
    </svg>
  );
  const ExpenseIcon = ({ className = "" }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 12h10" />  
    </svg>
  );
  
  

export default TransactionList;