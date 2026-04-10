import type { Metadata } from 'next'
import Script from 'next/script'
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
        <Script src="https://embeds.iubenda.com/widgets/156a47e8-f130-4505-a9c5-35bfc27d5c0f.js" strategy="afterInteractive" />
        <Navbar />
        <main>{children}</main>
        <footer className="site-footer">
          <div>
  <span>© 2025 Foundy — Dove le idee diventano startup</span>
  <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Beta v1.0</div>
</div>
          <div>
            <a href="/termini" style={{ color: '#94A3B8', textDecoration: 'none', marginLeft: 16 }}>Termini e Condizioni</a>
            <a href="https://www.iubenda.com/privacy-policy/67848851" target="_blank">Privacy Policy</a>
            <a href="https://www.iubenda.com/privacy-policy/67848851/cookie-policy" target="_blank">Cookie Policy</a>
          </div>
        </footer>
      </body>
    </html>
  )
}