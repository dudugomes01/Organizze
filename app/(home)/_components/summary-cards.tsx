"use client";

import React from "react";
import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
  EyeIcon,
} from "lucide-react";

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  amount: number;
  className?: string;
  size?: "default" | "large";
  userCanAddTransaction?: boolean;
}

const SummaryCard = ({
  icon,
  title,
  amount,
  className = "",
  size = "default",
}: SummaryCardProps) => {
  return (
    <div
      className={`rounded-xl p-4 bg-card border shadow-sm ${
        size === "large" ? "p-6" : "p-4"
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className={`${size === "large" ? "text-2xl" : "text-lg"} font-bold`}>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
        </span>
      </div>
    </div>
  );
};

interface SummaryCardsProps {
  month: string;
  year: string;
  balance: number;
  depositsTotal: number;
  investmentsTotal: number;
  accumulatedInvestments: number;
  expensesTotal: number;
  userCanAddTransaction?: boolean;
}

const SummaryCards = ({
  balance,
  depositsTotal,
  expensesTotal,
  investmentsTotal,
  accumulatedInvestments,
  userCanAddTransaction,
}: SummaryCardsProps) => {
  const [showValues, setShowValues] = React.useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatValue = (value: number) => {
    return showValues ? formatCurrency(value) : 'R$ •••••';
  };

  return (
    <>
      {/* Header Móvel */}
      <div className="block md:hidden">
        <div className="bg-white rounded-b-3xl shadow-sm px-4 pb-8 pt-4 space-y-8">
          {/* Saldo Total */}
          <div className="text-center space-y-2">
            <p className="text-gray-500 text-sm">Saldo atual em contas</p>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-4xl font-bold">
                {formatValue(balance)}
              </h1>
              <button 
                onClick={() => setShowValues(!showValues)}
                className="text-gray-500 hover:text-gray-700"
              >
                <EyeIcon size={20} />
              </button>
            </div>
          </div>

          {/* Receitas e Despesas */}
            <div className="flex justify-around max-w-xs mx-auto">
            {/* Receitas */}
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2.5 rounded-full">
              <TrendingUpIcon size={20} className="text-green-600" />
              </div>
              <div>
              <p className="text-sm text-gray-500">Receitas</p>
              <p className="text-green-600 font-medium">
                {formatValue(depositsTotal)}
              </p>
              </div>
            </div>

            {/* Despesas */}
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2.5 rounded-full">
              <TrendingDownIcon size={20} className="text-red-600" />
              </div>
              <div>
              <p className="text-sm text-gray-500">Despesas</p>
              <p className="text-red-600 font-medium">
                {formatValue(expensesTotal)}
              </p>
              </div>
            </div>
            </div>

            {/* Investimentos */}
            <div className="flex justify-center mt-4">
            <div className="flex items-center gap-3">
                <div className="bg-[#36005cb0] p-2.5 rounded-full">
                <PiggyBankIcon size={20} className="text-[#9600ff]" />
                </div>
              <div>
              <p className="text-sm text-gray-500">Investimentos</p>
                <p className="text-[#9600ff] font-medium">
                {formatValue(accumulatedInvestments)}
                </p>
              </div>
            </div>
            </div>
            </div>
        </div>
      

      {/* Versão Desktop */}
      <div className="space-y-6 hidden md:block">
        {/* Card Principal */}
        <div>
          <SummaryCard
            icon={<WalletIcon size={16} />}
            title="Saldo"
            amount={balance}
            size="large"
            userCanAddTransaction={userCanAddTransaction}
          />
        </div>

        {/* Cards Secundários */}
        <div className="grid grid-cols-3 gap-6">
          <SummaryCard
            icon={<PiggyBankIcon size={16} />}
            title="Investido"
            amount={investmentsTotal}
          />
          <SummaryCard
            icon={<TrendingUpIcon size={16} className="text-primary" />}
            title="Receita"
            amount={depositsTotal}
          />
          <SummaryCard
            icon={<TrendingDownIcon size={16} className="text-red-500" />}
            title="Despesas"
            amount={expensesTotal}
          />
        </div>
      </div>
    </>
  );
};

export default SummaryCards;