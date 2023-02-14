import { BarretenbergWasm } from "@aztec/sdk";
import { useEffect, useState } from "react";
import { render } from "../components/render";
import getChainId from "../utils/getChainId";
import getWasm from "../utils/getWasm";
import PopupWallet from "./PopupWallet";

function PopupApp() {
  const [wasm, setWasm] = useState<BarretenbergWasm>();

  useEffect(() => {
    getWasm().then(setWasm).catch(console.error);
  }, []);
  return !wasm ? (
    <div>"Loading..."</div>
  ) : (
    <PopupWallet chainId={getChainId()} wasm={wasm} />
  );
}

render(<PopupApp />);
