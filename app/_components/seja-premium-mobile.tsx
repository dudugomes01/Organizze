"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "./ui/button";

interface SejaPremiumMobileProps {
  className?: string;
}

export default function SejaPremiumMobile({ className = "px-4 py-6" }: SejaPremiumMobileProps) {
  return (
    <div className={`sm:hidden w-full flex justify-center ${className}`}>
      <Link href="/subscription">
        <Button className="bg-gradient-to-r from-[#4cff00] to-[#00ffd0] hover:from-[#00ffd0] hover:to-[#4cff00] text-black font-bold px-8 py-4 rounded-full shadow-xl text-lg animate-pulse w-[200px]">
          <Crown className="w-6 h-6 mr-3" />
          Seja Premium
        </Button>
      </Link>
    </div>
  );
}