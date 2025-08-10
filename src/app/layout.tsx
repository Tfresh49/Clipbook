import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { PwaInstallScript } from '@/components/pwa-install-script';

export const metadata: Metadata = {
  title: 'ClipBook-Online',
  description: 'A clean, intuitive app for creating, editing, and organizing notes with AI-powered features.',
  manifest: '/manifest.json',
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
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,14..72,200..900;1,14..72,200..900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#347C58" />
      </head>
      <body className="font-body antialiased">
        <PwaInstallScript />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
