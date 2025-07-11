"use client";

import { useState } from "react";
import { CreditCard, WalletCards, ChartBar } from "lucide-react";
import AiReportButton from "../(home)/_components/ai-report-button";
import Link from "next/link";

const NavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { title: "Dashboard", url: "/", icon: ChartBar },
    { title: "", url: "/transactions", icon: WalletCards },
    { title: "Assinatura", url: "/subscription", icon: CreditCard },
  ];

  return (
    <>
      <nav className="md:hidden flex justify-between border-solid px-8 py-4">
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
      </nav>

      {/* Sidebar Mobile com Animação */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
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
          style={{
            backgroundColor: "rgb(108, 0, 209)",
            borderRadius: "20px 0 0 20px",
          }}
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
                    style={{
                      backgroundColor: "white",
                      borderRadius: "5px",
                      padding: "3px 10px",
                    }}
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
