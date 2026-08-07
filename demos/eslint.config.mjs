import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs}"],
		plugins: { js },
		extends: ["js/recommended"],
		languageOptions: {
			globals: globals.node,
		},
	},
	{
		files: ["src/**/*.js"],
		languageOptions: {
			sourceType: "commonjs",
			globals: globals.node,
		},
	},
	{
		files: ["src/**/*.test.js"],
		languageOptions: {
			globals: globals.jest,
		},
	},
	prettier,
	{
		files: ["**/*.{js,mjs,cjs}"],
		rules: {
			quotes: ["error", "double"], // Exige comillas dobles en los strings.
			semi: ["error", "always"], // Exige punto y coma al final de las instrucciones.
			"no-var": "error", // Evita declaraciones con var.
			"prefer-const": "error", // Prefiere const cuando la variable no se reasigna.
			eqeqeq: ["error", "always"], // Exige comparaciones estrictas.
			curly: ["error", "all"], // Exige llaves en bloques de control.
			"no-else-return": "error", // Evita else después de un return.
			"no-shadow": "error", // Evita ocultar variables de un ámbito externo.
			"no-use-before-define": "error", // Exige definir elementos antes de usarlos.
			"no-param-reassign": "error", // Evita modificar parámetros directamente.
			"no-plusplus": "error", // Prefiere += 1 y -= 1 frente a ++ y --.
			"object-shorthand": "error", // Prefiere la sintaxis abreviada de objetos.
			"prefer-template": "error", // Prefiere template literals para concatenar texto.
			"object-curly-spacing": ["error", "always"], // Exige espacios dentro de objetos.
			"comma-spacing": ["error", { before: false, after: true }], // Exige espacio después de las comas.
			"block-spacing": ["error", "always"], // Exige espacios dentro de bloques en una línea.
		},
	},
]);
