
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { Toaster } from "react-hot-toast";
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "./index.css";
import App from "./App";

const theme = createTheme({
  primaryColor: "brand",
  defaultRadius: "md",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  colors: {
    brand: [
      "#FFF4EF", "#FFE4D8", "#FDC9B2", "#F9A57E", "#F58352",
      "#EF6430", "#E8501E", "#CE4214", "#F4581F", "#8A2B0E",
    ],
    dark: [
      "#EDF2F9", "#D5DEE9", "#A8B7CB", "#7C8DA6", "#5A6B84",
      "#3D4C63", "#243248", "#182338", "#101A2C", "#0B1220",
    ],
  },
});

// const stored = (localStorage.getItem("vh-theme") as "light" | "dark" | null) ?? "auto";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
<MantineProvider theme={theme} defaultColorScheme="light">
      <Toaster position="top-center" />
      <App />
    </MantineProvider>
  </StrictMode>
);