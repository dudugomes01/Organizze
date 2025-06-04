"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";

const NavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* NavBar principal - Somente mobile */}
      <nav className="md:hidden flex justify-between border-solid px-8 py-4">

        {/* Componente de foto do usuário */}
        <div className="flex items-center md:hidden">
          <UserButton showName={false} afterSignOutUrl="/" />
        </div>
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

        </div>
      </div>
    </>
  );
};

export default NavBar;
