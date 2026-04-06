import { useEffect, useState } from 'react'
import { X, RefreshCw } from 'lucide-react'

export type EmocionMascota = 'feliz' | 'dormido' | 'saltando' | 'ladrando'

interface Props {
  mensaje: string
  emocion?: EmocionMascota
  visible: boolean
  onCerrar: () => void
  onPedirConsejo?: () => void
}

// ── SVG del perro chibi kawaii (exportado para uso en otros componentes) ──────
export function PerroSVG({ emocion }: { emocion: EmocionMascota }) {
  // Ojos según emoción
  const eyes = {
    feliz: (
      <>
        {/* ojo izq */}
        <circle cx="37" cy="50" r="7" fill="white" />
        <circle cx="37" cy="51" r="5" fill="#3D1F00" />
        <circle cx="37" cy="51" r="3" fill="#1A0A00" />
        <circle cx="39" cy="49" r="1.5" fill="white" />
        <circle cx="35.5" cy="52.5" r="0.8" fill="white" />
        {/* ojo der */}
        <circle cx="63" cy="50" r="7" fill="white" />
        <circle cx="63" cy="51" r="5" fill="#3D1F00" />
        <circle cx="63" cy="51" r="3" fill="#1A0A00" />
        <circle cx="65" cy="49" r="1.5" fill="white" />
        <circle cx="61.5" cy="52.5" r="0.8" fill="white" />
        {/* brillitos cariñosos */}
        <path d="M 29 44 Q 37 40 45 44" stroke="#FFD166" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M 55 44 Q 63 40 71 44" stroke="#FFD166" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
      </>
    ),
    dormido: (
      <>
        {/* ojos cerrados — arcos curvos */}
        <path d="M 31 50 Q 37 44 43 50" stroke="#3D1F00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 57 50 Q 63 44 69 50" stroke="#3D1F00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* pestañas dormidas */}
        <line x1="34" y1="47" x2="33" y2="44" stroke="#3D1F00" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="37" y1="46" x2="37" y2="43" stroke="#3D1F00" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="60" y1="47" x2="59" y2="44" stroke="#3D1F00" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="63" y1="46" x2="63" y2="43" stroke="#3D1F00" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </>
    ),
    saltando: (
      <>
        {/* ojos brillantes grandes */}
        <circle cx="37" cy="50" r="8" fill="white" />
        <circle cx="37" cy="51" r="6" fill="#5C3000" />
        <circle cx="37" cy="51" r="3.5" fill="#1A0A00" />
        <circle cx="39.5" cy="48.5" r="2" fill="white" />
        <circle cx="35.5" cy="53" r="0.9" fill="white" />
        <circle cx="63" cy="50" r="8" fill="white" />
        <circle cx="63" cy="51" r="6" fill="#5C3000" />
        <circle cx="63" cy="51" r="3.5" fill="#1A0A00" />
        <circle cx="65.5" cy="48.5" r="2" fill="white" />
        <circle cx="61.5" cy="53" r="0.9" fill="white" />
      </>
    ),
    ladrando: (
      <>
        {/* ojos entrecerrados decididos */}
        <circle cx="37" cy="51" r="7" fill="white" />
        <circle cx="37" cy="52" r="5" fill="#3D1F00" />
        <circle cx="37" cy="52" r="3" fill="#1A0A00" />
        <circle cx="39" cy="50" r="1.5" fill="white" />
        <path d="M 30 46 L 44 46" stroke="#3D1F00" strokeWidth="2" strokeLinecap="round" />
        <circle cx="63" cy="51" r="7" fill="white" />
        <circle cx="63" cy="52" r="5" fill="#3D1F00" />
        <circle cx="63" cy="52" r="3" fill="#1A0A00" />
        <circle cx="65" cy="50" r="1.5" fill="white" />
        <path d="M 56 46 L 70 46" stroke="#3D1F00" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  }

  // Boca según emoción
  const mouth = {
    feliz: (
      <>
        <path d="M 43 67 Q 50 74 57 67" stroke="#C0724A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 46 67 Q 50 64 54 67" stroke="#C0724A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
    dormido: (
      <path d="M 45 66 Q 50 69 55 66" stroke="#C0724A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    ),
    saltando: (
      <>
        <path d="M 40 66 Q 50 78 60 66" stroke="#C0724A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 45 66 Q 50 62 55 66" stroke="#C0724A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
    ladrando: (
      <>
        <ellipse cx="50" cy="70" rx="9" ry="7" fill="#D4524A" />
        <ellipse cx="50" cy="73" rx="6" ry="3.5" fill="#FF9FB3" />
        {/* dientes */}
        <rect x="45" y="65" width="4" height="4" rx="1" fill="white" />
        <rect x="51" y="65" width="4" height="4" rx="1" fill="white" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 100 115"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* ── Cuerpo redondeado ── */}
      <ellipse cx="50" cy="100" rx="22" ry="14" fill="#F0C98A" />

      {/* ── Orejas floppy grandes y tiernas (detrás de cabeza) ── */}
      <ellipse cx="20" cy="44" rx="13" ry="22" fill="#D4924A" transform="rotate(-15 20 44)" />
      <ellipse cx="20" cy="44" rx="8" ry="15" fill="#E8B47A" transform="rotate(-15 20 44)" />
      <ellipse cx="80" cy="44" rx="13" ry="22" fill="#D4924A" transform="rotate(15 80 44)" />
      <ellipse cx="80" cy="44" rx="8" ry="15" fill="#E8B47A" transform="rotate(15 80 44)" />

      {/* ── Cabeza grande y redonda (chibi) ── */}
      <circle cx="50" cy="52" r="36" fill="#F0C98A" />

      {/* ── Mancha en la frente ── */}
      <ellipse cx="50" cy="36" rx="11" ry="9" fill="#E8B47A" opacity="0.6" />

      {/* ── Área del hocico suave ── */}
      <ellipse cx="50" cy="66" rx="16" ry="11" fill="#FAEBD7" />

      {/* ── Nariz tierna ── */}
      <ellipse cx="50" cy="60" rx="5" ry="3.5" fill="#C0724A" />
      <ellipse cx="48.5" cy="58.8" rx="1.5" ry="1" fill="white" opacity="0.6" />

      {/* ── Mejillas rosadas kawaii ── */}
      <ellipse cx="26" cy="62" rx="9" ry="6" fill="#FFB3C1" opacity="0.45" />
      <ellipse cx="74" cy="62" rx="9" ry="6" fill="#FFB3C1" opacity="0.45" />

      {/* ── Ojos ── */}
      {eyes[emocion]}

      {/* ── Boca ── */}
      {mouth[emocion]}

      {/* ── Collar con corazón ── */}
      <rect x="22" y="84" width="56" height="7" rx="3.5" fill="#FF8C42" />
      <path d="M 50 95 C 47 91 43 91 43 94.5 C 43 97.5 50 102 50 102 C 50 102 57 97.5 57 94.5 C 57 91 53 91 50 95 Z" fill="#FFD166" />
      <path d="M 50 95 C 47 91 43 91 43 94.5 C 43 97.5 50 102 50 102 C 50 102 57 97.5 57 94.5 C 57 91 53 91 50 95 Z" fill="#FFD166" />

      {/* ── ZZZ flotante cuando duerme ── */}
      {emocion === 'dormido' && (
        <>
          <text x="72" y="32" fontSize="8" fill="#A78BFA" fontWeight="bold" opacity="0.9">z</text>
          <text x="79" y="22" fontSize="11" fill="#A78BFA" fontWeight="bold" opacity="0.65">z</text>
          <text x="88" y="11" fontSize="14" fill="#A78BFA" fontWeight="bold" opacity="0.35">Z</text>
        </>
      )}

      {/* ── Estrellas de energía al saltar ── */}
      {emocion === 'saltando' && (
        <>
          <text x="5" y="28" fontSize="13" fill="#FFD166">✦</text>
          <text x="83" y="24" fontSize="9" fill="#FF8C42">✦</text>
          <text x="11" y="42" fontSize="8" fill="#FFD166" opacity="0.7">✦</text>
          <text x="79" y="38" fontSize="7" fill="#FFB3C1">✦</text>
        </>
      )}

      {/* ── Ondas sonoras al ladrar ── */}
      {emocion === 'ladrando' && (
        <>
          <path d="M 75 47 Q 82 52 75 57" stroke="#FF8C42" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 80 42 Q 90 52 80 62" stroke="#FF8C42" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M 85 37 Q 98 52 85 67" stroke="#FF8C42" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.25" />
        </>
      )}
    </svg>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function MascotaGuia({
  mensaje,
  emocion = 'feliz',
  visible,
  onCerrar,
  onPedirConsejo,
}: Props) {
  const [burbujaVisible, setBurbujaVisible] = useState(true)
  const [animKey, setAnimKey] = useState(0)

  // Cada vez que cambia el mensaje o emoción, reabre la burbuja y reinicia animación
  useEffect(() => {
    setBurbujaVisible(true)
    setAnimKey((k) => k + 1)
  }, [mensaje, emocion])

  if (!visible) return null

  const claseAnimacion =
    emocion === 'saltando'
      ? 'mascota-jump'
      : emocion === 'ladrando'
        ? 'mascota-shake'
        : 'mascota-float'

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2 select-none">
      {/* Burbuja de diálogo */}
      {burbujaVisible && mensaje && (
        <div
          key={`burbuja-${animKey}`}
          className="mascota-fade-in relative bg-white rounded-2xl rounded-bl-sm shadow-xl border border-pettech-orange/20 p-4 max-w-[230px]"
        >
          {/* Botón cerrar burbuja */}
          <button
            onClick={() => setBurbujaVisible(false)}
            className="absolute top-1.5 right-1.5 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Cerrar mensaje"
          >
            <X size={12} />
          </button>

          <p className="text-xs text-gray-700 leading-relaxed pr-3">{mensaje}</p>

          {/* Pedir otro consejo */}
          {onPedirConsejo && (
            <button
              onClick={onPedirConsejo}
              className="mt-2 flex items-center gap-1 text-pettech-orange text-xs hover:underline"
              aria-label="Pedir otro consejo"
            >
              <RefreshCw size={10} />
              Otro consejo
            </button>
          )}

          {/* Cola de burbuja apuntando al perro */}
          <div className="absolute -bottom-2 left-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
        </div>
      )}

      {/* Perro + botón minimizar */}
      <div className="flex items-end gap-1">
        <button
          key={`perro-${animKey}`}
          onClick={() => {
            if (!burbujaVisible) {
              setBurbujaVisible(true)
            } else if (onPedirConsejo) {
              onPedirConsejo()
            }
          }}
          className={`w-20 h-20 drop-shadow-lg cursor-pointer ${claseAnimacion}`}
          title={burbujaVisible ? 'Pedir consejo' : 'Ver mensaje'}
          aria-label="Mascota guía PetTech"
        >
          <PerroSVG emocion={emocion} />
        </button>

        {/* Botón ocultar mascota */}
        <button
          onClick={onCerrar}
          className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center mb-8 transition-colors"
          aria-label="Ocultar mascota guía"
          title="Ocultar"
        >
          <X size={10} />
        </button>
      </div>
    </div>
  )
}
