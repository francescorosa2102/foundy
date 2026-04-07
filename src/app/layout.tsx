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
      <head>
        <script type="text/javascript" src="https://embeds.iubenda.com/widgets/156a47e8-f130-4505-a9c5-35bfc27d5c0f.js" async></script>
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <footer style={{
          background: '#0D1117',
          borderTop: '1px solid #2D3F5C',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap' as const,
          gap: 12,
        }}>
          <div style={{ fontSize: 13, color: '#64748B' }}>
            © 2025 Foundy — Dove le idee diventano startup
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <a 
              href="https://www.iubenda.com/privacy-policy/67848851" 
              className="iubenda-white iubenda-noiframe iubenda-embed" 
              title="Privacy Policy"
              style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
            >
              Privacy Policy
            </a>
            <a 
              href="https://www.iubenda.com/privacy-policy/67848851/cookie-policy" 
              className="iubenda-white iubenda-noiframe iubenda-embed" 
              title="Cookie Policy"
              style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
            >
              Cookie Policy
            </a>
          </div>
        </footer>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`
          }}
        />
      </body>
    </html>
  )
}