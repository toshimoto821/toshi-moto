import path from "path";
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: {
      config: path.resolve(currentDir, "./tailwind.config.js"),
    },
    autoprefixer: {},
  },
};
