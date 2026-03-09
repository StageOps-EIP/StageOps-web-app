import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./lib/theme.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ErrorBoundary>
);
  