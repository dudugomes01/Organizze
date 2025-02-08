import type { Metadata } from "next";
import { Mulish } from "next/font/google"
import "./globals.css";
import { dark } from "@clerk/themes";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ptBR } from "@clerk/localizations";
import MobileBottomNav from './(home)/_components/MobileBottomNav';


const mulish = Mulish({
  subsets: ["latin-ext"]
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
    <body className={`${mulish.className} dark antialiased`}>
      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}
        localization={ptBR}
      >
        <div className="flex sm:h-full h-[120%] flex-col">{children}</div>
      </ClerkProvider>
      <Toaster />
      <MobileBottomNav/>
    </body>
  </html>
  );
}
