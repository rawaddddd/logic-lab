import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@xyflow/react/dist/base.css";
import { ReactFlowProvider } from "@xyflow/react";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <ReactFlowProvider>
        <App />
      </ReactFlowProvider>
    </TooltipProvider>
  </StrictMode>
);
