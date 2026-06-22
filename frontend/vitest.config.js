import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // coverage: {
    //   all: true,             // importante pour analyser tous les fichiers, pas juste les testés
    //   include: ['src/**/*.{ts,tsx,js,jsx}'], // adapter au chemin et extensions de votre projet
    //   exclude: ['**/*.test.{ts,tsx,js,jsx}', 'node_modules/**'], // exclure tests et dossiers externes
      // reporter: ['text'], // formats du rapport de coverage
      // reportsDirectory: './coverage',
    // },
  },
})