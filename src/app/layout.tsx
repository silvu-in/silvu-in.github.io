
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/context/Providers';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Silvu - Drones & Tech',
  description: 'Your premier source for tech products, specializing in drones and drone parts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
