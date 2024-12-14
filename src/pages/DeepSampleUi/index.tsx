import React from "react";
import { createRoot } from "react-dom/client";
import { DeepSampleUi } from "./DeepSampleUi";
import { ClerkProvider } from '@clerk/chrome-extension';
import { useNavigate, MemoryRouter } from 'react-router-dom';
import "./index.css";

const container = document.getElementById("deepsample-container") as HTMLElement;
if (!container) {
  throw new Error("Container deepsample-container not found");
}
const root = createRoot(container);

// Set this in your .env file or build environment. It is public and safe to expose.
//const publishableKey = "pk_test_d2hvbGUtbGlvbmZpc2gtNjkuY2xlcmsuYWNjb3VudHMuZGV2JA"; // Development key
const publishableKey = "pk_live_Y2xlcmsuYXlyYWxlZ2FsLmNvbSQ"; // Production key

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      routerPush={to => navigate(to)}
      routerReplace={to => navigate(to, { replace: true })}
    >
      <DeepSampleUi/>
    </ClerkProvider>
  );
}

root.render(
  <MemoryRouter>
    <ClerkProviderWithRoutes />
  </MemoryRouter>
);
