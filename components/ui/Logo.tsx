// components/ui/Logo.tsx
// Logo Kiva360 — Variante A: Nodos de conocimiento

interface LogoProps {
  variant?: 'dark' | 'light' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  showTagline?: boolean
}

const SIZES = {
  sm: { symbol: 20, width: 90,  h: 22, fx: 28, fy1: 10, fy2: 19, ft1: 9,  ft2: 7  },
  md: { symbol: 28, width: 120, h: 30, fx: 38, fy1: 13, fy2: 25, ft1: 12, ft2: 9  },
  lg: { symbol: 40, width: 160, h: 42, fx: 52, fy1: 18, fy2: 34, ft1: 16, ft2: 11 },
}

const COLORS = {
  dark:  { dot1: '#1A56DB', dot2: '#1A56DB', line: '#1A56DB', text: '#0D1B2A', sub: '#9B9A97' },
  light: { dot1: '#60A5FA', dot2: '#60A5FA', line: '#60A5FA', text: '#FFFFFF', sub: 'rgba(255,255,255,0.4)' },
  blue:  { dot1: '#FFFFFF', dot2: '#FFFFFF', line: '#FFFFFF', text: '#FFFFFF', sub: 'rgba(255,255,255,0.6)' },
}

export function Logo({ variant = 'dark', size = 'md', showText = true, showTagline = false }: LogoProps) {
  const s = SIZES[size]
  const c = COLORS[variant]
  const sym = s.symbol

  // Posiciones relativas al símbolo
  const cx = sym / 2
  const r  = sym * 0.13

  // Nodo superior (centro)
  const nx = cx
  const ny = sym * 0.22

  // Nodo inferior izquierdo
  const lx = sym * 0.22
  const ly = sym * 0.78

  // Nodo inferior derecho
  const rx2 = sym * 0.78
  const ry = sym * 0.78

  const totalW = showText ? s.width : sym
  const totalH = showTagline ? s.h + 12 : s.h

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Líneas de conexión */}
      <line x1={nx} y1={ny + r} x2={lx} y2={ly - r}
        stroke={c.line} strokeWidth={sym * 0.045} strokeOpacity="0.35" strokeLinecap="round"/>
      <line x1={nx} y1={ny + r} x2={rx2} y2={ry - r}
        stroke={c.line} strokeWidth={sym * 0.045} strokeOpacity="0.35" strokeLinecap="round"/>
      <line x1={lx + r} y1={ly} x2={rx2 - r} y2={ry}
        stroke={c.line} strokeWidth={sym * 0.045} strokeOpacity="0.35" strokeLinecap="round"/>

      {/* Nodo inferior izquierdo */}
      <circle cx={lx} cy={ly} r={r} fill={c.dot2} fillOpacity="0.6"/>

      {/* Nodo inferior derecho */}
      <circle cx={rx2} cy={ry} r={r} fill={c.dot2} fillOpacity="0.85"/>

      {/* Nodo superior — principal */}
      <circle cx={nx} cy={ny} r={r * 1.2} fill={c.dot1}/>

      {/* Texto */}
      {showText && (
        <>
          <text
            x={s.fx} y={s.fy1}
            fontFamily="Inter, -apple-system, sans-serif"
            fontWeight="800"
            fontSize={s.ft1}
            fill={c.text}
            letterSpacing="-0.5"
          >
            Kiva
          </text>
          <text
            x={s.fx} y={s.fy2}
            fontFamily="Inter, -apple-system, sans-serif"
            fontWeight="400"
            fontSize={s.ft2}
            fill={c.sub}
            letterSpacing="1"
          >
            360
          </text>
        </>
      )}

      {/* Tagline opcional */}
      {showTagline && showText && (
        <text
          x={s.fx} y={totalH - 2}
          fontFamily="Inter, -apple-system, sans-serif"
          fontWeight="500"
          fontSize={6}
          fill={c.sub}
          letterSpacing="1.5"
        >
          GESTIÓN ESCOLAR
        </text>
      )}
    </svg>
  )
}

// Ícono solo para favicon, sidebar, etc.
export function LogoIcon({ variant = 'dark', size = 28 }: { variant?: 'dark'|'light'|'blue'; size?: number }) {
  const c = COLORS[variant]
  const r = size * 0.13

  const nx = size * 0.5
  const ny = size * 0.22
  const lx = size * 0.22
  const ly = size * 0.78
  const rx2 = size * 0.78
  const ry = size * 0.78

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <line x1={nx} y1={ny + r} x2={lx} y2={ly - r}
        stroke={c.line} strokeWidth={size * 0.045} strokeOpacity="0.35" strokeLinecap="round"/>
      <line x1={nx} y1={ny + r} x2={rx2} y2={ry - r}
        stroke={c.line} strokeWidth={size * 0.045} strokeOpacity="0.35" strokeLinecap="round"/>
      <line x1={lx + r} y1={ly} x2={rx2 - r} y2={ry}
        stroke={c.line} strokeWidth={size * 0.045} strokeOpacity="0.35" strokeLinecap="round"/>
      <circle cx={lx} cy={ly} r={r} fill={c.dot2} fillOpacity="0.6"/>
      <circle cx={rx2} cy={ry} r={r} fill={c.dot2} fillOpacity="0.85"/>
      <circle cx={nx} cy={ny} r={r * 1.2} fill={c.dot1}/>
    </svg>
  )
}
