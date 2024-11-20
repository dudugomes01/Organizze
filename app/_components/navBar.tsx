"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { CreditCard, WalletCards, ChartBar } from "lucide-react";
import AiReportButton from "../(home)/_components/ai-report-button";

const NavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { title: "Dashboard", url: "/", icon: ChartBar },
    { title: "Transações", url: "/transactions", icon: WalletCards },
    { title: "Assinatura", url: "/subscription", icon: CreditCard },
  ];

  return (
    <>
      {/* NavBar principal */}
      <nav className="flex justify-between border-b border-solid px-8 py-4 lg:flex">
        {/* ESQUERDA */}
        <div className="flex items-center gap-10">
          <Image src="/logo.svg" width={173} height={39} alt="Finance AI" />
          {/* Menu de navegação - Somente no Desktop */}
          <div className="hidden lg:flex gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className={
                  pathname === item.url
                    ? "font-bold text-primary"
                    : "text-muted-foreground"
                }
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        {/* DIREITA */}
        <div className="flex items-center gap-4">
          {/* Botão para abrir a Sidebar no Mobile */}
          <button
            aria-label="Open menu"
            className={`block lg:hidden p-2 ${
              isSidebarOpen ? "text-black" : "text-primary"
            }`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
                d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5"
              />
            </svg>
          </button>

          {/* UserButton - Sempre visível */}
          <UserButton showName />
        </div>
      </nav>

      {/* Sidebar - Somente no Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          {/* Sidebar com transição suave */}
          <div
            className={`h-full w-64 bg-secondary bg-opacity-90 shadow-lg relative transform transition-all duration-30000 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Botão de fechar */}
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

            {/* Menu */}
            <nav className="p-6 pt-16">
              {/* Ajustado padding-top para descer os links */}
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.url}
                      className="flex items-center gap-4 text-lg font-medium text-black hover:text-gray-700"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      {/* Ícone */}
                      {<item.icon className="w-5 h-5" />}
                      {/* Título */}
                      {item.title}
                    </Link>
                  </li>
                ))}
                  <AiReportButton hasPremiumPlan={false} month={""}/>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;