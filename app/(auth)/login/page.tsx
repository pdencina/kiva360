import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* Panel izquierdo — marca */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#061326] via-[#0A1929] to-[#0F2D52] flex-col justify-between p-12">
        <div className="absolute top-[-120px] right-[-120px] w-[320px] h-[320px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[-120px] w-[320px] h-[320px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center text-xl">
            📚
          </div>
          <span className="font-serif text-2xl text-white">Kiva360</span>
        </div>

        <div>
          <h1 className="font-serif text-5xl text-white leading-[1.05] tracking-tight mb-6 max-w-xl">
            La plataforma que los colegios chilenos estaban esperando
          </h1>
          <p className="text-blue-100/80 text-lg leading-relaxed mb-10 max-w-lg">
            SIGE · SAE · JUNAEB integrados en un solo lugar.
            Sin doble digitación, sin errores.
          </p>

          <div className="flex flex-col gap-3">
            {[
              '✓ Libro de clases digital conforme MINEDUC',
              '✓ Integración directa con SIGE, SAE y JUNAEB',
              '✓ Comunicación con apoderados en tiempo real',
              '✓ Currículum actualizado automáticamente',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-blue-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-blue-900">
          🇨🇱 Hecho en Chile · kiva360.cl
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in">
        <div className="w-full max-w-md bg-white border border-gray-100 shadow-2xl shadow-gray-200/60 rounded-3xl p-10">
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center text-base">
              📚
            </div>
            <span className="font-serif text-xl text-gray-900">Kiva360</span>
          </div>

          <h2 className="font-serif text-4xl text-gray-900 mb-2 tracking-tight">
            Bienvenido/a
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Ingresa con la cuenta de tu colegio
          </p>

          <LoginForm />

          <p className="text-xs text-gray-400 text-center mt-6">
            ¿Problemas para ingresar?{' '}
            <a href="mailto:soporte@kiva360.cl" className="text-primary-600 hover:underline">
              Contactar soporte
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
