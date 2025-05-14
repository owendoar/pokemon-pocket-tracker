import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pokémon Card Collection Tracker',
  description: 'Track your Pokémon card collection and calculate pull odds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
        <footer className="text-center py-4 text-gray-500 text-sm">
          <p>Pokémon Card Collection Tracker - {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}