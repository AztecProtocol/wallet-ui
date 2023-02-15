import { FormEvent, useRef, useState } from "react";

export const GENERATE_ACCOUNT_STRING = "Create New Account";
interface ConnectAccountProps {
  connect: (userPassword: string, encryptedKeys: string) => void;
  initialEncryptedKeystore: string | null;
  initialUserPassword: string | null;
  generateEncryptedKeystore: (userPassword: string) => Promise<string>;
}
export default function ConnectAccount({
  connect,
  initialEncryptedKeystore,
  initialUserPassword,
  generateEncryptedKeystore,
}: ConnectAccountProps) {
  const [userPassword, setUserPassword] = useState(initialUserPassword || "");
  // Note: this is stored in the password manager
  const [encryptedKeystore, setEncryptedKeystore] = useState(
    initialEncryptedKeystore || ""
  );
  const [showWarning, setShowWarning] = useState(false);
  const handleGeneratePassword = async () => {
    if (encryptedKeystore) {
      setShowWarning(true);
      // TODO could be more robust
      setTimeout(() => {
        setShowWarning(false);
      }, 10000);
      return;
    } else {
      // Generate encrypted keys
      setEncryptedKeystore(await generateEncryptedKeystore(userPassword));
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    connect(encryptedKeystore, userPassword);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          {/* TODO test ergonomics of password manager
          Can we nicely have two password entries? */}
          <label htmlFor="password">Passphrase:</label>
          <input
            id="user-pass"
            value={userPassword}
            onChange={(event) => setUserPassword(event.target.value)}
          />
        </div>
        <div>
          <input
            style={{ opacity: 0, pointerEvents: "none" }} // Hide visually and disable clicks
            aria-hidden="true" // Hide for accessibility tools
            type="password"
            id="encrypted-keys"
            autoComplete="current-password"
            name="password"
            value={encryptedKeystore}
            onChange={(event) => setEncryptedKeystore(event.target.value)}
          />
        </div>
        <button
          id="create-account-button"
          type="button"
          onClick={handleGeneratePassword}
        >
          {GENERATE_ACCOUNT_STRING}
        </button>
        <button
          id="connect-button"
          type="submit"
          onClick={() => connect(userPassword, encryptedKeystore)}
        >
          Connect
        </button>
        {encryptedKeystore && (
          <button
            id="encrypted-keys-button"
            type="submit"
            onClick={() => setEncryptedKeystore("")}
          >
            Forget Encrypted Keys
          </button>
        )}
      </form>
      {showWarning && (
        <div className="warning-toast">There are already encrypted keys.</div>
      )}
    </>
  );
}
