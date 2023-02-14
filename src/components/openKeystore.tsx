import { AztecBuffer, AztecKeyStore, BarretenbergWasm } from "@aztec/sdk";
import { useState } from "react";
import {
  getCachedEncryptedKeystore,
  setCachedEncryptedKeystore,
  setCachedPassword,
} from "../utils/sessionUtils.js";
import "./openKeystore.css";

export interface OpenKeyStoreProps {
  wasm: BarretenbergWasm;
  onKeystoreOpened(keystore: AztecKeyStore): void;
}

export function OpenKeystore({ wasm, onKeystoreOpened }: OpenKeyStoreProps) {
  const [encryptedKeystore, setEncryptedKeystore] = useState<string>(
    getCachedEncryptedKeystore() || ""
  );
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);

  return (
    <div className="open-keystore">
      <div className="row">
        <input
          type="text"
          value={encryptedKeystore}
          onChange={(e) => setEncryptedKeystore(e.target.value)}
          placeholder="Encrypted keystore"
        />
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </div>
      <div className="row">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <label>Remember me</label>
      </div>
      <div className="row">
        <button
          onClick={async () => {
            try {
              const keystore = await AztecKeyStore.open(
                AztecBuffer.from(encryptedKeystore, "hex"),
                password,
                wasm,
                []
              );
              setCachedEncryptedKeystore(encryptedKeystore);
              if (remember) {
                setCachedPassword(password);
              }
              onKeystoreOpened(keystore);
            } catch (error) {
              console.error(error);
            }
          }}
        >
          Open keystore
        </button>
      </div>
    </div>
  );
}
