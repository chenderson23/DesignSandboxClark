import type { Metadata } from 'next';
import Providers from './providers';
import { AppShell } from './app';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Phoenix Demo',
  description: 'Allegion Phoenix Design System Demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
