module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'react',
		'react-hooks',
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
	],
	env: {
		browser: true,
		node: true,
	},
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		}
	},
	settings: {
		react: {
			version: '17'
		}
	}
};
