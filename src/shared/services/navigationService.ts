import type { NavigateFunction } from 'react-router-dom'

let _navigate: NavigateFunction | null = null

export function registerNavigate(navigate: NavigateFunction): void {
  _navigate = navigate
}

export function navigateTo(path: string): void {
  _navigate?.(path)
}
