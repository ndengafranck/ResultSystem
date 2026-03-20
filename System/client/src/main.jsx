/** @format */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { SyncProvider } from './context/SyncContext';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SyncProvider><App /></SyncProvider>
  </StrictMode>
);
