"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Home, LineChart, PiggyBank, Repeat, Plus, Crown } from "lucide-react";
import AddTransactionButton from "../../_components/add-transaction-button";
import { Sheet, SheetContent, SheetTrigger } from "../../_components/ui/sheet";

const MobileHamburgerMenu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [userCanAddTransaction, setUserCanAddTransaction] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const checkCanAddTransaction = async () => {
    try {
      const response = await fetch("/api/can-add-transaction");
      const data = await response.json();
      setUserCanAddTransaction(data.canAddTransaction ?? false);
      setIsPremium(data.hasPremiumPlan ?? false);
    } catch {
      setUserCanAddTransaction(false);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCanAddTransaction();
  }, []);

  useEffect(() => {
    checkCanAddTransaction();
  }, [pathname]);

  useEffect(() => {
    if (!dialogIsOpen) {
      const timeoutId = setTimeout(() => {
        checkCanAddTransaction();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [dialogIsOpen]);

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
      setIsOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const navItems = [
    { icon: Home, path: "/", label: "Dashboard" },
    { icon: LineChart, path: "/transactions", label: "Transações" },
    { icon: PiggyBank, path: "/investment", label: "Investimentos" },
    { icon: Repeat, path: "/my-subscriptions", label: "Assinaturas" },
    { icon: Crown, path: "/subscription", label: isPremium ? "Gerenciar Assinatura" : "Seja Premium" }
  ];

  return (
    <>
      <div className="fixed top-2 left-2 z-50 sm:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className="p-2.5 bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg hover:bg-gray-800 transition-colors"
              aria-label="Abrir menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </SheetTrigger>
          
          <SheetContent 
            side="left" 
            className="w-[280px] bg-gradient-to-br from-[#000a1b] via-[#0a0f1f] to-[#000a1b] border-r border-gray-800 p-0"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-800/50">
                <h2 className="text-xl font-bold text-white mb-1">Menu</h2>
                <p className="text-sm text-gray-400">Navegação</p>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 py-4">
                <ul className="space-y-2 px-4">
                  {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    
                    return (
                      <li key={item.path}>
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-[#55B02E]/20 border border-[#55B02E]/40 text-[#55B02E] shadow-lg shadow-[#55B02E]/10'
                              : 'bg-gray-900/50 border border-gray-800/50 text-gray-400 hover:bg-gray-800/50 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-[#55B02E]' : ''}`} />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Add Transaction Button */}
              <div className="p-4 border-t border-gray-800/50">
                <button
                  onClick={handleAddTransactionClick}
                  disabled={!userCanAddTransaction || isLoading}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl font-semibold transition-all duration-200 ${
                    userCanAddTransaction && !isLoading
                      ? 'bg-gradient-to-r from-[#55B02E] to-emerald-600 hover:from-emerald-600 hover:to-[#55B02E] text-white shadow-lg shadow-[#55B02E]/30'
                      : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Adicionar Transação</span>
                </button>
                {!userCanAddTransaction && !isLoading && (
                  <p className="text-xs text-yellow-500 text-center mt-2">
                    Limite atingido. Seja Premium!
                  </p>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
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

export default MobileHamburgerMenu;
