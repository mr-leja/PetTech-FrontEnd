import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Solo medir cobertura en los módulos que la suite cubre actualmente
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
