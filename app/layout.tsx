import type { Metadata } from "next";
import { Mulish } from "next/font/google"
import "./globals.css";
import { dark } from "@clerk/themes";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ptBR } from "@clerk/localizations";
// import MobileBottomNav from './(home)/_components/MobileBottomNav';


const mulish = Mulish({
  subsets: ["latin-ext"]
})

export const metadata: Metadata = {
  title: "Atlas",
  description: "Sua plataforma de organização financeira",
  icons: {
	icon: "/favicon.ico",
	apple: "/LogoAtlas-cel.jpg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${mulish.className} dark antialiased`}>
      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}
        // @ts-expect-error - Localization type mismatch between Clerk versions
        localization={ptBR}
      >
        <div className="flex sm:h-full flex-col">{children}</div>
      </ClerkProvider>
      <Toaster />
      {/* <MobileBottomNav/> */}
    </body>
  </html>
  );
}
