import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from '@/shared/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'BLIH CORE - HR Portal',
  description: 'Business Lifecycle Integrated Hub',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
