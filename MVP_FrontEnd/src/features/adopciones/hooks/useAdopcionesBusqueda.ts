import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { solicitudesApi, type Adopcion } from '../api/solicitudesApi'

export function useAdopcionesBusqueda() {
  const [busqueda, setBusqueda] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adopciones', 'todas'],
    queryFn: () => solicitudesApi.listarAdopciones(),
    refetchInterval: 30_000,
    staleTime: 0,
  })

  const adopcionesFiltradas: Adopcion[] = data?.results.filter((a: Adopcion) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return (
      a.mascota_nombre.toLowerCase().includes(q) ||
      a.familia_nombre.toLowerCase().includes(q) ||
      a.familia_email.toLowerCase().includes(q) ||
      (a.mascota_raza ?? '').toLowerCase().includes(q)
    )
  }) ?? []

  return { busqueda, setBusqueda, adopcionesFiltradas, isLoading, isError, total: data?.count ?? 0 }
}
