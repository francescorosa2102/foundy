import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'

export const metadata: Metadata = {
  title: 'Foundy — Dove le idee diventano startup',
  description: 'Condividi idee. Trova talenti. Costruisci insieme.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}