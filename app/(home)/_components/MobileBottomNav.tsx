"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Repeat, Plus, LineChart, PiggyBank } from "lucide-react";
import AddTransactionButton from "../../_components/add-transaction-button";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../_components/ui/tooltip";

const MobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [userCanAddTransaction, setUserCanAddTransaction] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const checkCanAddTransaction = async () => {
    try {
      const response = await fetch("/api/can-add-transaction");
      const data = await response.json();
      setUserCanAddTransaction(data.canAddTransaction ?? false);
    } catch {
      setUserCanAddTransaction(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCanAddTransaction();
  }, []);

  // Atualizar quando o pathname mudar (navegação entre páginas)
  useEffect(() => {
    checkCanAddTransaction();
  }, [pathname]);

  // Atualizar quando o diálogo fechar (após criar/deletar transação)
  useEffect(() => {
    if (!dialogIsOpen) {
      // Pequeno delay para garantir que a transação foi processada
      const timeoutId = setTimeout(() => {
        checkCanAddTransaction();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [dialogIsOpen]);

  // Listener para eventos customizados (quando transação é deletada/criada)
  useEffect(() => {
    const handleTransactionChange = () => {
      checkCanAddTransaction();
    };

    window.addEventListener("transaction-updated", handleTransactionChange);
    return () => {
      window.removeEventListener("transaction-updated", handleTransactionChange);
    };
  }, []);

  const handleAddTransactionClick = () => {
    if (userCanAddTransaction) {
      setDialogIsOpen(true);
    }
  };

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: LineChart, path: "/transactions", label: "Transações" },
    { 
      icon: Plus, 
      label: "Adicionar", 
      isMain: true, 
      onClick: handleAddTransactionClick,
      disabled: !userCanAddTransaction
    },
    { icon: PiggyBank, path: "/investment", label: "Investimento" },
    { icon: Repeat, path: "/my-subscriptions", label: "Assinaturas" }
    // { icon: Settings, path: "/settings", label: "Configurações" }
  ];

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:hidden">
        <nav className="bg-[#202123] rounded-full px-6 py-3">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => {
              const isDisabled = item.disabled || isLoading;
              const isMainButton = item.isMain;
              
              const buttonContent = (
                <button
                  onClick={item.onClick || (() => router.push(item.path))}
                  disabled={isDisabled}
                  className={`flex items-center justify-center transition-opacity ${
                    isMainButton 
                      ? `bg-[#22c55e] p-2 rounded-2xl ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}` 
                      : 'p-1'
                  }`}
                >
                  <item.icon
                    size={24}
                    className={`${
                      pathname === item.path
                        ? 'text-white'
                        : isMainButton
                        ? 'text-black'
                        : 'text-gray-500'
                    }`}
                  />
                </button>
              );

              if (isMainButton && !userCanAddTransaction && !isLoading) {
                return (
                  <li key={item.path || item.label}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {buttonContent}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Você atingiu o limite de transações. Atualize seu plano para criar ilimitadas.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                );
              }

              return (
                <li key={item.path || item.label}>
                  {buttonContent}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      {dialogIsOpen && (
        <AddTransactionButton
          userCanAddTransaction={userCanAddTransaction}
          dialogIsOpen={dialogIsOpen}
          setDialogIsOpen={setDialogIsOpen}
        />
      )}
    </>
  );
};

export default MobileBottomNav;