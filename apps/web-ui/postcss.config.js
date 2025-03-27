import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const config = path.resolve(currentDir, "./tailwind.config.js");

export default {
  plugins: {
    tailwindcss: {
      config,
    },
    autoprefixer: {},
  },
};
