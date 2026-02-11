import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary Brand Colors - Executive Authority
        navy: {
          50: '#F0F3F8',
          100: '#E1E7F0',
          200: '#C2CFE1',
          300: '#9EB0C9',
          400: '#6E86A3',
          500: '#4A5B6E',
          600: '#2C3E5A',
          700: '#1E2F45',
          800: '#0A1A2F',
          900: '#05101F',
        },
        gold: {
          50: '#FDF9E7',
          100: '#FCF3CF',
          200: '#F9E79F',
          300: '#F5D76F',
          400: '#F1C40F',
          500: '#EAB308',
          600: '#C6A13B',
          700: '#9E7B2C',
          800: '#765B1E',
          900: '#4E3C14',
        },
        // Secondary - Energy & Action
        electric: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        coral: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Neutrals - Modern & Clean
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        border: 'hsl(var(--border))',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A1A2F 0%, #1E3A5F 100%)',
        'cta-gradient': 'linear-gradient(135deg, #C6A13B 0%, #EAB308 100%)',
        'card-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        'subtle-pattern': "radial-gradient(circle at 1px 1px, #E2E8F0 1px, transparent 0)",
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'hard': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 0 2px rgba(198, 161, 59, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.01)',
      },
      borderRadius: {
        'hero': '24px',
        'card': '16px',
        'button': '8px',
        'badge': '9999px',
      },
      spacing: {
        'section': '120px',
        'container': '1280px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'fade-up': 'fadeUp 0.8s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config