"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Repeat, Plus, LineChart, PiggyBank } from "lucide-react";
import AddTransactionButton from "../../_components/add-transaction-button";
import { useState } from "react";


const MobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter(); // Substituir router do next/router pelo useRouter
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: LineChart, path: "/transactions", label: "Transações" },
    { 
      icon: Plus, 
      label: "Adicionar", 
      isMain: true, 
      onClick: () => setDialogIsOpen(true) 
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
            {navItems.map((item) => (
              <li key={item.path || item.label}>
                <button
                  onClick={item.onClick || (() => router.push(item.path))} // Corrigido para usar useRouter
                  className={`flex items-center justify-center ${
                    item.isMain ? 'bg-[#22c55e] p-2 rounded-2xl' : 'p-1'
                  }`}
                >
                  <item.icon
                    size={24}
                    className={`${
                      pathname === item.path
                        ? 'text-white'
                        : item.isMain
                        ? 'text-black'
                        : 'text-gray-500'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {dialogIsOpen && (
        <AddTransactionButton
          userCanAddTransaction={true}
          dialogIsOpen={dialogIsOpen}
          setDialogIsOpen={setDialogIsOpen}
        />
      )}
    </>
  );
};

export default MobileBottomNav;