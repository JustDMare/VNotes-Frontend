import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require("./cypress/plugins/index.ts").default(on, config);
    },
    baseUrl: "http://localhost:3000",
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
});
