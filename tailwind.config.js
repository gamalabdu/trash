/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#1b1c1e',
        'brand-text': '#F0EEF0',
        'brand-red': '#f93b3b',
        'brand-secondary': '#b8b8b8',
        'brand-light': '#f8f8f8',
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'primary': ['Bebas Neue', 'sans-serif'],
        'secondary': ['Work Sans', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #F0EEF0 0%, #f8f8f8 50%, #F0EEF0 100%)',
        'text-gradient': 'linear-gradient(135deg, #1a1a1a 0%, #333333 50%, #1a1a1a 100%)',
      },
      animation: {
        'grain': 'grain 12s steps(10) infinite',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        }
      },
      fontSize: {
        'responsive-hero': 'clamp(1.8rem, 8vmin, 4rem)',
        'responsive-content': 'clamp(1.5rem, 6vmin, 3rem)',
        'responsive-service': 'clamp(1.2rem, 5vmin, 2.5rem)',
        'responsive-overlay': 'clamp(1.5rem, 4vw, 2.5rem)',
        'responsive-error': 'clamp(1.2rem, 2.5vw, 1.8rem)',
        'enter-text-xs': '4em',
        'enter-text-sm': '6em',
        'enter-text-md': '7em',
        'enter-text-lg': '8em',
        'enter-text-xl': '9em',
        'enter-text-2xl': '11em',
        'enter-text-3xl': '20vw',
      },
      spacing: {
        'hero-padding-y': 'clamp(3rem, 8vh, 6rem)',
        'hero-padding-x': 'clamp(2rem, 8vw, 6rem)',
        'content-padding-y': 'clamp(3rem, 10%, 8rem)',
        'content-padding-x': 'clamp(2rem, 8vw, 6rem)',
        'hero-gap': 'clamp(2rem, 4vh, 3rem)',
        'content-gap': 'clamp(2.5rem, 5vh, 4rem)',
      },
      minHeight: {
        'hero': '65vh',
        'hero-mobile': '50vh',
        'hero-small': '45vh',
        'content': 'auto',
        'content-mobile': '40vh',
        'content-small': '35vh',
        'offers': '50vh',
        'offers-mobile': '40vh',
        'screen-adjusted': 'calc(100dvh - 100px)',
        'screen-adjusted-mobile': 'calc(100dvh - 80px)',
      },
      dropShadow: {
        'brand': '0 8px 20px rgba(0, 0, 0, 0.15)',
        'brand-hover': '0 12px 25px rgba(0, 0, 0, 0.2)',
        'text-overlay': '2px 2px 8px rgba(0, 0, 0, 0.7)',
        'text-overlay-hover': '2px 2px 12px rgba(249, 59, 59, 0.5)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      scale: {
        '130': '1.3',
      },
    },
  },
  plugins: [],
} 