import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueI18n from "@intlify/vite-plugin-vue-i18n";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueI18n({
      // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
      // compositionOnly: false,
      defaultSFCLang: "json",
      globalSFCScope: true,
      include: path.resolve(__dirname, "./src/locales/**"),
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
