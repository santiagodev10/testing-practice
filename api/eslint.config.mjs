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
			quotes: ["error", "double"],
			semi: ["error", "always"],
			"no-var": "error",
			"prefer-const": "error",
			eqeqeq: ["error", "always"],
			curly: ["error", "all"],
			"no-else-return": "error",
			"no-shadow": "error",
			"no-use-before-define": "error",
			"no-param-reassign": "error",
			"no-plusplus": "error",
			"object-shorthand": "error",
			"prefer-template": "error",
			"object-curly-spacing": ["error", "always"],
			"comma-spacing": ["error", { before: false, after: true }],
			"block-spacing": ["error", "always"],
			"no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
		},
	},
]);