/**
 * Tests — SPEC-001: Validaciones de correo electrónico y contraseña (Frontend)
 * Covers: LoginPage y RegisterPage (paso 1) — Zod schema + on-blur behavior.
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/features/auth/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    registro: vi.fn(),
  },
}))

vi.mock('@/features/familias/api/familiasApi', () => ({
  familiasApi: { crearFamilia: vi.fn() },
}))

vi.mock('@/shared/store/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setAuth: vi.fn(), updateUser: vi.fn(), clearAuth: vi.fn() }),
}))

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}))

const renderWithRouter = (component: React.ReactElement) =>
  render(<MemoryRouter>{component}</MemoryRouter>)

// ---------------------------------------------------------------------------
// LoginPage — CRITERIO-2.1 / CRITERIO-2.2
// ---------------------------------------------------------------------------

describe('LoginPage — validación del campo correo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows error when email has no @', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByRole('textbox', { name: /correo/i })
    await user.type(emailInput, 'notanemail')
    await user.tab() // trigger on-blur

    await waitFor(() => {
      expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
    })
  })

  it('shows error when email is empty on submit', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    const submitBtn = screen.getByRole('button', { name: /ingresar/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/correo es obligatorio/i)).toBeInTheDocument()
    })
  })

  it('shows error when email is too short', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByRole('textbox', { name: /correo/i })
    await user.type(emailInput, 'a@b')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/correo es demasiado corto/i)).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// RegisterPage paso 1 — CRITERIO-1.2 / CRITERIO-1.6
// ---------------------------------------------------------------------------

describe('RegisterPage (paso 1) — validación del campo correo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows error when email has no @ in step 1', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    const emailInput = screen.getByRole('textbox', { name: /correo/i })
    await user.type(emailInput, 'invalidemail')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
    })
  })

  it('shows error when email exceeds 254 characters', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    const longEmail = 'a'.repeat(244) + '@example.com' // > 254 chars
    const emailInput = screen.getByRole('textbox', { name: /correo/i })
    await user.type(emailInput, longEmail)
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('El correo no puede superar 254 caracteres.')).toBeInTheDocument()
    })
  })

  it('shows no error when email is valid', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    const emailInput = screen.getByRole('textbox', { name: /correo/i })
    await user.type(emailInput, 'valido@pettech.com')
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText('Ingresa un correo electrónico válido.')).not.toBeInTheDocument()
      expect(screen.queryByText('El correo es obligatorio.')).not.toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// LoginPage — CRITERIO-3.4 / CRITERIO-3.5 (contraseña mínimo 8)
// ---------------------------------------------------------------------------

describe('LoginPage — validación del campo contraseña', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows error when password has less than 8 characters', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    const passwordInput = screen.getByLabelText(/contraseña/i)
    await user.type(passwordInput, '1234567') // 7 chars
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Mínimo 8 caracteres.')).toBeInTheDocument()
    })
  })

  it('does not show complexity error in login (only min length applies)', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    const passwordInput = screen.getByLabelText(/contraseña/i)
    await user.type(passwordInput, '12345678') // 8 chars, no letter/special — valid for login
    await user.tab()

    await waitFor(() => {
      expect(
        screen.queryByText(/incluir al menos una letra/i)
      ).not.toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// RegisterPage paso 1 — CRITERIO-3.2 / CRITERIO-3.6 (complejidad contraseña)
// ---------------------------------------------------------------------------

describe('RegisterPage (paso 1) — validación del campo contraseña', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows complexity error when password has no special character', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    const passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
    await user.type(passwordInput, 'MiClave1') // sin especial
    await user.tab()

    await waitFor(() => {
      expect(
        screen.getByText('La contraseña debe incluir al menos una letra, un número y un carácter especial.')
      ).toBeInTheDocument()
    })
  })

  it('shows complexity error when password has only numbers', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    const passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
    await user.type(passwordInput, '12345678') // solo números
    await user.tab()

    await waitFor(() => {
      expect(
        screen.getByText('La contraseña debe incluir al menos una letra, un número y un carácter especial.')
      ).toBeInTheDocument()
    })
  })

  it('shows no error when password meets all complexity rules', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RegisterPage />)

    const passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
    await user.type(passwordInput, 'MiClave1!')
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText(/incluir al menos una letra/i)).not.toBeInTheDocument()
      expect(screen.queryByText('Mínimo 8 caracteres.')).not.toBeInTheDocument()
    })
  })
})
