import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { compressImage } from '../formSchema'

export function useMascotaForm() {
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fotoEliminada, setFotoEliminada] = useState(false)
  const [carnetFile, setCarnetFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)

  const handleFoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setFotoEliminada(false)
    setFotoFile(compressed)
    setPreview(URL.createObjectURL(compressed))
  }

  const removeFoto = () => {
    setFotoFile(null)
    setPreview(null)
    setFotoEliminada(true)
  }

  return {
    fotoFile, setFotoFile,
    preview, setPreview,
    fotoEliminada, setFotoEliminada,
    carnetFile, setCarnetFile,
    step, setStep,
    handleFoto, removeFoto,
  }
}
