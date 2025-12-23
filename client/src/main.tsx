import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TRPCProvider } from "./components/TRPCProvider";

createRoot(document.getElementById("root")!).render(
  <TRPCProvider>
    <App />
  </TRPCProvider>
);
