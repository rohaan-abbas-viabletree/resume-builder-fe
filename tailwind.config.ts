import { Tag } from "antd";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  important: true,

  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)"],
      },
      minWidth: {
        "14px": "14px",
      },
      minHeight: {
        "14px": "14px",
      },
      borderColor: {
        mainborder: "#C7C9CA",
        border_primary: "#677DEC",
        border_red: "#FF5656",
        border_red_secondary:"#D03135",
        border_input_disabled: "#8D95A3",
        danger_border: "#FF5656",
        table_border: "#ced0d1",
        dotted_border: "#D9D9D9",
      },
      borderRadius: {
        "10px": "10px",
      },
      maxWidth: {
        "150px": "150px",
      },

      backgroundColor: {
        bg_primary: "#677DEC",
        bg_input_disable_color: "#E0E0E0",
        bg_danger: "#FF56560D",
        bg_inner_primary: "#677DEC1A",
        bg_tab_active: "#EBF0F3",
        bg_tab_inactive: "#F8FAFB",
        grey1: "#F4F4F6",
        grey2: "#FAFAFA",
        color_lightred:"#D031351A",
      },
      backgroundImage: {
        bg_blue_linear:
          "linear-gradient(180deg, rgba(65, 152, 226, 0.05) 0%, rgba(24, 114, 190, 0.05) 100%)",
        bg_red_linear:
          "linear-gradient(180deg, rgba(255, 86, 86, 0.08) 0%, rgba(190, 24, 24, 0.08) 100%)",
          bg_red_linear_secondary:"linear-gradient(180deg, #D03135 0%, #6A191B 137.5%)"
      },
      colors: {
        color_primary: "#677DEC",
        color_dark_purple: "#2B3674",
        color_purple: "#707EAE",
        color_white:"#fff",
        background: "var(--background)",
        foreground: "var(--foreground)",
        color_danger: "#FF5656",
        black1: "#152B48",
        black2: "#2B3144",
        color_red:"#D03135",
        // tagcolor
        tag_success: "#03A66D",
        tag_error: "#FF5656",
        tag_info: "#C97C00",
        warning: "#CD8518",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
