import { isLogEnabled, enableLogs } from "@aztec/sdk";
import { ReactElement } from "react";
import * as ReactDOM from "react-dom/client";

declare global {
  interface Window {
    web3: any;
    ethereum: any;
    aztecSdk: any;
    handoverSession?: string;
  }
}

export default function render(element: ReactElement) {
  if (!isLogEnabled("bb:") && process.env.NODE_ENV !== "production") {
    enableLogs("bb:*");
    location.reload();
  }

  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(element);
}
