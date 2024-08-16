// eslint-disable-next-line
const isCI = process.env.CI === "true";

export default {
  plugins: {
    tailwindcss: {
      config: isCI
        ? "./apps/web-ui/tailwind.config.js"
        : "./tailwind.config.js",
    },
    autoprefixer: {},
  },
};
