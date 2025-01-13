'use client'; 

import React, {  } from 'react';
import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from 'lucide-react';
import SummaryCard from './summary-card';

interface SummaryCardsProps {
  month: string;
  year: string;
  balance: number;
  depositsTotal: number;
  investmentsTotal: number;
  expensesTotal: number;
  userCanAddTransaction?: boolean;
}

const SummaryCards = ({
  balance,
  depositsTotal,
  expensesTotal,
  investmentsTotal,
  userCanAddTransaction,
}: SummaryCardsProps) => {
  // const [storedBalance, setStoredBalance] = useState<number>(0);

  // useEffect(() => {
  //   const savedBalance = localStorage.getItem('balance');
  //   if (savedBalance) {
  //     setStoredBalance(Number(savedBalance));
  //   }
  // }, []);

  // useEffect(() => {
  //   if (balance > 0) {
  //     localStorage.setItem('balance', String(balance));
  //     setStoredBalance(balance);
  //   }
  // }, [balance]);

  return (
    <div className="space-y-6">
      {/* PRIMEIRO CARD */}
      <SummaryCard
        icon={<WalletIcon size={16} />}
        title="Saldo"
        amount={balance}
        size="large"
        userCanAddTransaction={userCanAddTransaction}
      />

      {/* OUTROS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard
          icon={<PiggyBankIcon size={16} />}
          title="Investido"
          amount={investmentsTotal}
          className="w-1/2 sm:w-auto"
        />
        <SummaryCard
          icon={<TrendingUpIcon size={16} className="text-primary" />}
          title="Receita"
          amount={depositsTotal}
          className="w-1/2 sm:w-auto"
        />
        <SummaryCard
          icon={<TrendingDownIcon size={16} className="text-red-500" />}
          title="Despesas"
          amount={expensesTotal}
          className="w-1/2 sm:w-auto"
        />
      </div>
    </div>
  );
};

export default SummaryCards;
