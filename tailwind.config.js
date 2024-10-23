import primeUIPlugin from 'tailwindcss-primeui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts,vue}"],
  theme: {
    extend: {},
  },
  plugins: [primeUIPlugin]
}

