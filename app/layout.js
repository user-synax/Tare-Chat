import "./globals.css";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tare Chat",
  description: "A minimal full-stack chat application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
