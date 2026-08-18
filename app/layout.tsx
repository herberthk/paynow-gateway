import type { Metadata } from "next";

import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Inter } from "next/font/google";
import ThemeInitializer from "@/components/global/ThemeInitializer";
import Toast from "@/components/global/Toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ConnectPay",
  description: "ConnectPay payment gateway",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme-storage');
                  if (stored) {
                    const { state } = JSON.parse(stored);
                    if (state && state.theme) {
                      document.documentElement.classList.add(state.theme);
                      return;
                    }
                  }
                  // Default to dark mode if no stored preference
                  document.documentElement.classList.add('dark');
                } catch (e) {
                  // Default to dark mode on error
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-gray-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 antialiased transition-colors duration-200`}
        suppressHydrationWarning
      >
        <ThemeInitializer />
        <NextTopLoader />
        <Toast />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
