import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './src/test/setup.ts')],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.github/**',
      'coverage/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/features/adopciones/api/calendarioApi.ts',
        'src/shared/store/authStore.ts',
        'src/features/adopciones/domain/calendarioDomain.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/main.tsx',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/router/**',
      ],
    },
  },
})
