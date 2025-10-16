// eslint.config.js
import js from '@eslint/js';
import * as tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import promise from 'eslint-plugin-promise';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            // nom du plugin = préfixe utilisé dans rules
            '@typescript-eslint': tseslint,
            react,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
            import: importPlugin,
            'unused-imports': unusedImports,
            security,
            sonarjs,
            promise,
            prettier,
        },
        settings: {
            react: { version: 'detect' },
            'import/resolver': {
                node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
            },
        },
        rules: {
            /* --- React --- */
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            /* --- Imports --- */
            'import/order': [
                'warn',
                {
                    groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
                    'newlines-between': 'always',
                },
            ],
            'unused-imports/no-unused-imports': 'error',

            /* --- Security --- */
            'security/detect-object-injection': 'off',
            'object-curly-spacing': ['error', 'always'],

            /* --- Prettier --- */
            'prettier/prettier': ['warn', { singleQuote: true, semi: true, trailingComma: 'all' }],

            /* --- Quality --- */
            'sonarjs/no-duplicate-string': 'warn',
            'sonarjs/cognitive-complexity': ['warn', 20],
        },
        ignores: ['dist', 'build', 'node_modules', 'coverage'],
    },
];
