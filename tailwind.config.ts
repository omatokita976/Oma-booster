import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    ink: "#07060f", panel: "#0f0d1c", line: "#25213d",
    volt: "#8b2dff", neon: "#19b8ff"
  }, boxShadow: { glow: "0 0 40px -10px rgba(139,45,255,.55)" } } },
  plugins: [],
} satisfies Config;
