import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import expoPlugin from 'eslint-plugin-expo';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
    // Ignore patterns
    {
        ignores: [
            'node_modules/**',
            'android/**',
            'ios/**',
            '.expo/**',
            'dist/**',
            'build/**',
            '*.config.js',
            '*.config.mjs',
            'babel.config.js',
            'metro.config.js',
            'tailwind.config.js',
        ],
    },

    // Base JS config
    js.configs.recommended,

    // TypeScript config
    ...tseslint.configs.recommended,

    // React config
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            'react-native': reactNativePlugin,
            expo: expoPlugin,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                // React Native globals
                __DEV__: 'readonly',
                fetch: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                alert: 'readonly',
                FormData: 'readonly',
                XMLHttpRequest: 'readonly',
                Blob: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                AbortController: 'readonly',
                // Node.js globals for config files
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',
                global: 'readonly',
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            // React rules
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/display-name': 'off',
            'react/jsx-uses-react': 'off',
            'react/jsx-uses-vars': 'error',

            // React Hooks rules
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // React Native rules
            'react-native/no-unused-styles': 'warn',
            'react-native/no-inline-styles': 'off',
            'react-native/no-color-literals': 'off',

            // TypeScript rules
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',

            // General rules
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-undef': 'off', // TypeScript handles this
        },
    },

    // Prettier config (must be last)
    prettierConfig,
);
