import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    typecheck: {
      enabled: true,
      include: ["src/**/*.test.ts"],
      tsconfig: 'tsconfig.app.json',
      checker: 'tsc',
    }
  }

})
