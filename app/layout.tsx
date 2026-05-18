import type { Metadata } from 'next'
import { Sora, DM_Serif_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets:  ['latin'],
  variable: '--font-sora',
  display:  'swap',
})

const dmSerif = DM_Serif_Display({
  weight:   ['400'],
  style:    ['normal', 'italic'],
  subsets:  ['latin'],
  variable: '--font-dm-serif',
  display:  'swap',
})

const jetbrains = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-jetbrains',
  display:  'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'Kiva360 — Plataforma Educativa Chile',
    template: '%s · Kiva360',
  },
  description:
    'Gestión escolar integrada con SIGE, SAE y JUNAEB. La plataforma educativa que los colegios chilenos estaban esperando.',
  keywords: ['educación', 'Chile', 'SIGE', 'SAE', 'JUNAEB', 'libro de clases', 'gestión escolar'],
  authors: [{ name: 'Kiva360' }],
  openGraph: {
    type:        'website',
    locale:      'es_CL',
    url:         'https://kiva360.cl',
    siteName:    'Kiva360',
    title:       'Kiva360 — Plataforma Educativa Chile',
    description: 'Gestión escolar integrada con SIGE, SAE y JUNAEB.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${sora.variable} ${dmSerif.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
