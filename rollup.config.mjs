import pluginTs from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

const input = "src/index.ts";
const external = ["react", "react/jsx-runtime", "@tanstack/react-query"];
const globals = {
  react: "React",
};
const name = "useData";
const commonOptions = {
  globals,
  sourcemap: true,
  name,
};

export default defineConfig([
  {
    input,
    output: [
      { file: "lib/useData.cjs", format: "cjs", ...commonOptions },
      { file: "lib/useData.mjs", format: "es", ...commonOptions },
    ],
    external,
    plugins: [pluginTs()],
  },
]);
