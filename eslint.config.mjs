import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default [{
	ignores: [
		"**/*.min.*",
		"scripts/three.*",
		"scripts/anime.*",
		"scripts/wilson.*",
		"scripts/lapsa.*",
		"debug/*",
		"projects/wilson/*",
		"applets/calcudoku-generator/scripts/solver.*",
		"applets/sudoku-generator/scripts/solver.*",
		"applets/wilsons-algorithm/scripts/random-walk.*",
		"jsconfig.json",
		"scripts/src/sitemap.js",
	],
}, ...compat.extends("eslint:recommended"), {
	plugins: {
		"@stylistic": stylistic,
	},

	languageOptions: {
		globals: {
			...globals.browser,
			...globals.node,
		},

		ecmaVersion: "latest",
		sourceType: "module",
	},

	rules: {
		"indent": ["warn", "tab", {
			SwitchCase: 1,
		}],

		"linebreak-style": ["error", "unix"],
		"quotes": ["warn", "double"],
		"@stylistic/semi": ["error", "always"],

		"no-unused-vars": ["warn", {
			args: "after-used",
		}],

		"prefer-const": ["warn", {
			destructuring: "any",
		}],

		"no-use-before-define": ["error", {
			functions: false,
			classes: true,
			variables: true,
			allowNamedExports: false,
		}],

		"object-curly-spacing": ["warn", "always", {
			arraysInObjects: false,
			objectsInObjects: true,
		}],

		"no-template-curly-in-string": ["warn"],
		"no-unused-private-class-members": ["warn"],
		"curly": ["error", "all"],
		"no-implicit-globals": ["error"],
		"no-var": ["error"],

		"no-trailing-spaces": ["warn", {
			skipBlankLines: true,
		}],

		"space-infix-ops": ["warn"],

		"max-len": ["warn", {
			code: 100,
			ignoreTemplateLiterals: true,
		}],

		"quote-props": ["error", "consistent-as-needed"],

		"no-multiple-empty-lines": ["warn", {
			max: 3,
			maxEOF: 0,
		}],

		"object-shorthand": ["warn", "always", {
			avoidQuotes: true,
		}],

		"dot-notation": ["warn"],
		"constructor-super": ["error"],
		"no-constant-binary-expression": ["warn"],
		"no-constructor-return": ["error"],
		"no-duplicate-imports": ["warn"],
		"no-new-native-nonconstructor": ["error"],
		"no-self-compare": ["warn"],
		"no-unmodified-loop-condition": ["warn"],
		"@stylistic/spaced-comment": ["warn", "always"],
	},
}];