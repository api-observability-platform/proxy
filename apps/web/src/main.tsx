import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { initWebEnv } from "@/env";

const rootEl = document.getElementById("root");
if (!rootEl) {
	throw new Error("Missing #root — check index.html");
}

try {
	initWebEnv();
} catch (err) {
	const msg = err instanceof Error ? err.message : String(err);
	document.body.classList.add("bg-black", "text-white", "antialiased");
	rootEl.innerHTML = `<div style="max-width:32rem;margin:3rem auto;padding:0 1rem;font-family:system-ui,sans-serif"><h1 style="font-size:1.25rem;margin-bottom:0.5rem">App configuration error</h1><p style="opacity:.75;font-size:.875rem">${msg.replace(/</g, "&lt;")}</p><p style="margin-top:1rem;opacity:.6;font-size:.875rem">Fix <code style="opacity:1">VITE_*</code> in <code style="opacity:1">.env</code> at the repo root, then restart Vite.</p></div>`;
	throw err;
}

createRoot(rootEl).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
