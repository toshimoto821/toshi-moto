// eslint-disable-next-line
const isCI = process.env.CYPRESS_RUNNING === "true";

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
