"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { CreditCard, WalletCards, ChartBar, PiggyBank, Repeat } from "lucide-react";
import AiReportButton from "../(home)/_components/ai-report-button";

const NavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { title: "Dashboard", url: "/", icon: ChartBar },
    { title: "Transação", url: "/transactions", icon: WalletCards },
    { title: "Investimento", url: "/investment", icon: PiggyBank },
    { title: "Minhas Assinaturas", url: "/my-subscriptions", icon: Repeat },
    { title: "Assinatura", url: "/subscription", icon: CreditCard },
  ];

  return (
    <>
      {/* NavBar principal - Desktop */}
      <nav className="hidden lg:flex items-center justify-between px-6 xl:px-8 py-4 bg-gradient-to-br from-[#000a1b] via-[#0a0f1f] to-[#000a1b] border-b border-gray-800/50 backdrop-blur-xl sticky top-0 z-50">
        {/* ESQUERDA - Logo e Menu */}
        <div className="flex items-center gap-8 xl:gap-12">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105">
            <Image 
              src="/logo-name.png" 
              width={230} 
              height={46} 
              alt="Atlas" 
              className="h-[46px] w-auto"
              priority
            />
          </Link>
          
          {/* Menu de navegação */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.url;
              
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-lg
                    transition-all duration-300 ease-in-out
                    ${isActive 
                      ? "text-[#55B02E] bg-[#55B02E]/10" 
                      : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                    }
                    group
                  `}
                >
                  {/* Indicador de página ativa */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#55B02E]/20 blur-sm" />
                  )}
                  
                  {/* Ícone */}
                  <Icon 
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-[#55B02E]" : "text-gray-500 group-hover:text-[#55B02E]"
                    }`} 
                  />
                  
                  {/* Texto */}
                  <span className={`relative text-sm font-medium transition-colors ${
                    isActive ? "text-[#55B02E]" : "group-hover:text-white"
                  }`}>
                    {item.title}
                  </span>
                  
                  {/* Linha inferior para página ativa */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[#55B02E] to-emerald-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* DIREITA - UserButton */}
        <div className="flex items-center gap-4">
          {/* UserButton com container estilizado */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors">
            <UserButton
              showName={false}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </nav>

      {/* Sidebar Mobile com Animação */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ease-in-out ${
        isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        {/* Overlay com fade */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar com deslize */}
        <div
          className={`absolute right-0 h-full w-64 bg-secondary shadow-lg transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ backgroundColor: "rgb(108, 0, 209)", borderRadius: "20px 0 0 20px" }}
        >
          <button
            className="absolute top-4 right-4 p-2 z-50 text-black"
            aria-label="Close menu"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <nav className="p-6 pt-16">
            <ul className="mt-10 space-y-4">
              {menuItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.url}
                    className="flex items-center gap-4 text-lg font-medium text-black hover:text-gray-700"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ backgroundColor: "white", borderRadius: "5px", padding: "3px 10px" }}
                  >
                    {<item.icon className="w-5 h-5" />}
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex justify-center mt-10">
              <AiReportButton hasPremiumPlan={false} month={""} />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default NavBar;