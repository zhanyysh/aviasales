import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AuthProvider from '../context/AuthProvider';
import Navigator from '../components/Navigator';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aviasales',
  description: 'Find and book cheap flights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Навигатор и провайдер авторизации */}
        <AuthProvider>
          <Navigator />
          {/* ...existing code... */}
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
