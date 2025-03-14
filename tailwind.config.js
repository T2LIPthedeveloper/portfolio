/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'primary': {
        100: '#0052CC', // Jira blue (lol)
        200: '#0066FF', // Bright tech blue
        300: '#1E88E5', // Material blue
        400: '#2196F3', // Slightly lighter blue
        500: '#42A5F5', // Light blue
        600: '#64B5F6'  // Very light blue
      },
      'surface': {
        100: '#121212',
        200: '#282828',
        300: '#3f3f3f',
        400: '#575757',
        500: '#717171',
        600: '#8b8b8b'
      },
      'on-background': '#ffffff',
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient': 'linear-gradient(var(--tw-gradient-stops))',
        'gradient-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
        'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'gradient-to-bl': 'linear-gradient(to bottom left, var(--tw-gradient-stops))',
        'gradient-to-tr': 'linear-gradient(to top right, var(--tw-gradient-stops))',
        'gradient-to-tl': 'linear-gradient(to top left, var(--tw-gradient-stops))',
      },
    },
    fontFamily: {
      'body': ['"Inter"', 'Helvetica', 'sans-serif']
    }
  },
  plugins: [],
}
