/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './App.{js,jsx,ts,tsx}',
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './screens/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                heading: ['Outfit-Bold', 'sans-serif'],
                body: ['Poppins-Regular', 'sans-serif'],
            },
            fontSize: {
                display: ['32px', { lineHeight: '38px', fontWeight: '700' }],
                h1: ['24px', { lineHeight: '30px', fontWeight: '700' }],
                h2: ['20px', { lineHeight: '26px', fontWeight: '600' }],
                h3: ['18px', { lineHeight: '24px', fontWeight: '600' }],
                'body-lg': ['16px', { lineHeight: '24px', fontWeight: '500' }],
                body: ['14px', { lineHeight: '22px', fontWeight: '400' }],
                caption: ['12px', { lineHeight: '18px', fontWeight: '500' }],
            },
            colors: {
                primary: {
                    DEFAULT: '#7d3bed',
                    '01': '#7d3bed',
                    '02': '#f471b7',
                },
                secondary: {
                    DEFAULT: '#b39ef5',
                    '01': '#b39ef5',
                    '02': '#f9b8dd',
                },
                border: {
                    DEFAULT: '#d2d2d2',
                    '01': '#d2d2d2',
                    '02': '#e7e7e7',
                },
            },
        },
    },
    plugins: [],
};
