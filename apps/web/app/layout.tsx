import type { Metadata } from 'next'
import './globals.css'
import SiteHeader from '../components/site-header'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Marketplace web pública',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        <SiteHeader />

        {children}

        <footer className="mt-16 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
            <p>Marketplace, catálogo público</p>
          </div>
        </footer>
      </body>
    </html>
  )
}