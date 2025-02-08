"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Receipt, Plus, LineChart, Settings } from "lucide-react";
import AddTransactionButton from "../../_components/add-transaction-button";


const MobileBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: LineChart, path: "/transactions", label: "Recibos" },
    { icon: Plus, path: "/new", label: "Adicionar", isMain: true, buttonComponent: <AddTransactionButton userCanAddTransaction={true} /> },
    { icon: Receipt, path: "/subscription", label: "Análises" },
    { icon: Settings, path: "/settings", label: "Configurações" }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:hidden">
      <nav className="bg-[#202123] rounded-full px-6 py-3">
        <ul className="flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => router.push(item.path)}
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
  );
};

export default MobileBottomNav;