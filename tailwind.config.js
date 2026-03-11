/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./script.js"],
    theme: {
        extend: {
            fontFamily: {
                title: ["Cinzel", "serif"],
                body: ["Inter", "sans-serif"]
            },
            colors: {
                ygo: {
                    dark: "#0f172a",
                    card: "#1e293b",
                    gold: "#fbbf24",
                    accent: "#3b82f6"
                }
            },
            aspectRatio: {
                card: "59 / 86"
            }
        }
    }
};
