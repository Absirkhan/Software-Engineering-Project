/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f8f9fa',
        secondary: '#5469d4',
        accent: '#7795f8',
        background: '#f8faff',
        text: '#424770',
        textLight: '#8898aa',
        border: '#e6ebf1',
        buttonText: '#fff',
        buttonHover: '#4a5bcb',
        githubButton: '#333',
        githubButtonHover: '#24292e',
        success: '#66bb6a',
        warning: '#ffa726',
        error: '#ef5350',
        info: '#29b6f6',
        white: '#ffffff',
        black: '#000000',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      boxShadow: {
        card: '0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
        button: '0 4px 12px rgba(84, 105, 212, 0.4)',
        githubButton: '0 4px 12px rgba(0, 0, 0, 0.2)',
        nav: '0 4px 12px rgba(0, 0, 0, 0.15)',
        input: '0 1px 3px rgba(50, 50, 93, 0.15), 0 1px 0 rgba(0, 0, 0, 0.02)'
      },
      fontFamily: {
        sans: ['Poppins', 'var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-bg': 'linear-gradient(135deg, #f8faff, #f5f0ff)',
      },
    },
  },
  plugins: [],
};
