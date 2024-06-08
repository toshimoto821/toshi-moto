const commonjs = require("@rollup/plugin-commonjs");
const { terser } = require("rollup-plugin-terser");

module.exports = [
  {
    input: "./bitcoin.js",
    output: {
      file: "dist/bitcoin.mjs",
      format: "esm",
    },
    plugins: [commonjs()],
  },
  {
    input: "./bitcoin.js",
    output: {
      file: "dist/bitcoin.min.mjs",
      format: "esm",
    },
    plugins: [commonjs(), terser()],
  },
];
