import './globals.css'

export const metadata = {
  title: 'Kiva360',
  description: 'Plataforma educacional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}