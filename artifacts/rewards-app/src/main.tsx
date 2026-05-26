import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Wire up the auth token getter so all API calls include the Bearer token
setAuthTokenGetter(() => localStorage.getItem("rrc_token"));

createRoot(document.getElementById("root")!).render(<App />);
