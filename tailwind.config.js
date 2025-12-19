/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require('daisyui'),
    ],
    // Agregamos esto para habilitar ambos temas
    daisyui: {
      themes: ["light", "dark"], 
    },
  }