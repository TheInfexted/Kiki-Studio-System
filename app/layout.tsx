import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kiki Studio',
  description: 'Korean-style makeup artist — Kepong, KL',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
