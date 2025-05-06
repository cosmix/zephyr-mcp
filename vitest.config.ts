import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Vitest configuration options
    globals: true, // Use global APIs (describe, test, expect)
    environment: "node", // Specify the test environment
    // Add setup files if needed, e.g., for mocking fetch
    // setupFiles: ['./src/test/setup.ts'],
    // Include test files matching the pattern
    include: ["src/**/*.test.ts"],
    // Exclude node_modules and build directories
    exclude: ["node_modules", "dist", "build"],
    // Coverage configuration (optional)
    // coverage: {
    //   provider: 'v8', // or 'istanbul'
    //   reporter: ['text', 'json', 'html'],
    // },
  },
});
