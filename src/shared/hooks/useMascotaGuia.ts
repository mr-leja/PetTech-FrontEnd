import { useCallback, useState } from 'react'
import type { EmocionMascota } from '../components/MascotaGuia'

interface EstadoMascota {
  visible: boolean
  mensaje: string
  emocion: EmocionMascota
}

const CONSEJOS_GENERALES = [
  'Recuerda vacunar a tu mascota cada año 💉',
  '¡Las vacunas protegen de enfermedades graves! 🛡️',
  'Agenda revisiones veterinarias periódicas 🩺',
  'El agua fresca es esencial para tu mascota todos los días 💧',
  'Dale ejercicio diario para mantenerla saludable 🏃‍♂️',
  'Recuerda desparasitar a tu mascota regularmente 🌿',
]

const CONSEJOS_CALENDARIO = [
  'Recuerda vacunar a tu mascota cada año 💉',
  '¡Mantén el calendario al día para una vida larga y feliz! 🐾',
  'Las vacunas vencidas son un riesgo. ¡Agenda ya! ⚠️',
  'Consulta a tu vet si tienes dudas sobre qué vacunas aplican 🩺',
]

export function useMascotaGuia() {
  const [estado, setEstado] = useState<EstadoMascota>({
    visible: false,
    mensaje: '',
    emocion: 'feliz',
  })

  const mostrar = useCallback((mensaje: string, emocion: EmocionMascota = 'feliz') => {
    setEstado({ visible: true, mensaje, emocion })
  }, [])

  const ocultar = useCallback(() => {
    setEstado((prev) => ({ ...prev, visible: false }))
  }, [])

  // ── Bienvenida al ingresar al dashboard ──────────────────────────────────
  const mostrarBienvenida = useCallback(
    (nombre: string) => {
      mostrar(
        `¡Hola, ${nombre}! 👋 Soy Peluso, tu guía en PetTech. ¿Listo para dar un hogar a una mascota?`,
        'feliz',
      )
    },
    [mostrar],
  )

  // ── Celebrar adopción completada ─────────────────────────────────────────
  const celebrarAdopcion = useCallback(() => {
    mostrar('¡Felicidades por tu adopción! 🎉 ¡Acabas de cambiar una vida para siempre!', 'saltando')
    setTimeout(() => {
      mostrar('¡Prepara tu hogar con agua, comida y mucho amor! 🏠❤️', 'feliz')
    }, 5000)
  }, [mostrar])

  // ── Felicitar al completar el formulario de solicitud ────────────────────
  const celebrarFormulario = useCallback(() => {
    mostrar(
      '¡Ya diste tu primer paso! 🐾 Tu solicitud está en revisión. ¡Pronto tendrás noticias!',
      'saltando',
    )
  }, [mostrar])

  // ── Consejo del calendario de vacunación ─────────────────────────────────
  const consejoCalendario = useCallback(() => {
    const consejo = CONSEJOS_CALENDARIO[Math.floor(Math.random() * CONSEJOS_CALENDARIO.length)]
    mostrar(consejo, 'feliz')
  }, [mostrar])

  // ── Consejo general aleatorio ────────────────────────────────────────────
  const consejoPedido = useCallback(() => {
    const consejo = CONSEJOS_GENERALES[Math.floor(Math.random() * CONSEJOS_GENERALES.length)]
    mostrar(consejo, 'feliz')
  }, [mostrar])

  // ── Guía en pantallas específicas ───────────────────────────────────────
  const guiarMascotas = useCallback(() => {
    mostrar(
      '¡Aquí están todas las mascotas disponibles! Usa los filtros para encontrar tu compañero ideal 🐕🐈',
      'feliz',
    )
  }, [mostrar])

  const guiarSolicitudes = useCallback(() => {
    mostrar(
      'Aquí puedes ver el estado de tus solicitudes de adopción. ¡Estamos procesando tu caso! 📋',
      'ladrando',
    )
  }, [mostrar])

  // ── Reaccionar al estado de una solicitud ───────────────────────────────
  const reaccionarAprobada = useCallback(() => {
    mostrar(
      '¡Tu solicitud fue APROBADA! 🎊 ¡Pronto serás una familia completa!',
      'saltando',
    )
  }, [mostrar])

  const reaccionarRechazada = useCallback(() => {
    mostrar(
      'No te desanimes 💪 Hay más mascotas esperando un hogar. ¡Sigue intentando!',
      'feliz',
    )
  }, [mostrar])

  // ── Modo dormitar cuando todo está tranquilo ────────────────────────────
  const dormitar = useCallback(() => {
    mostrar('Zzz... Todo está tranquilo 😴 ¡Explora el menú para comenzar!', 'dormido')
  }, [mostrar])

  return {
    visible: estado.visible,
    mensaje: estado.mensaje,
    emocion: estado.emocion,
    ocultar,
    mostrar,
    mostrarBienvenida,
    celebrarAdopcion,
    celebrarFormulario,
    consejoCalendario,
    consejoPedido,
    guiarMascotas,
    guiarSolicitudes,
    reaccionarAprobada,
    reaccionarRechazada,
    dormitar,
  }
}
