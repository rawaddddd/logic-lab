import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@xyflow/react/dist/base.css";
import "./index.css";
import { ReactFlowProvider } from "@xyflow/react";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="logic-lab-ui-theme">
      <TooltipProvider>
        <ReactFlowProvider>
          <App />
        </ReactFlowProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
);
