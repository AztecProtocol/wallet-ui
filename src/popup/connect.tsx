import React, { FormEvent, useRef, useState } from 'react';
import { useFormState } from '../utils/useFormState.js';

export const GENERATE_ACCOUNT_STRING = 'Create New Account';
interface ConnectAccountProps {
  connect: (userPassword: string, encryptedKeys: string) => void;
  initialEncryptedKeystore: string | null;
  generateEncryptedKeystore: (userPassword: string) => Promise<string>;
}
export function ConnectAccount({ connect, initialEncryptedKeystore, generateEncryptedKeystore }: ConnectAccountProps) {
  const userPassword = useRef('');
  // Note: this is stored in the password manager
  const [encryptedKeystore, setEncryptedKeystore] = useFormState(initialEncryptedKeystore || '');
  const [showWarning, setShowWarning] = useState(false);
  const handleGeneratePassword = async () => {
    if (userPassword.current) {
      setShowWarning(true);
      // TODO could be more robust
      setTimeout(() => {
        setShowWarning(false);
      }, 1000);
      return;
    } else {
      // Generate encrypted keys
      setEncryptedKeystore(await generateEncryptedKeystore(userPassword.current));
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    connect(encryptedKeystore.current, userPassword.current);
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
            value={userPassword.current}
            onChange={event => (userPassword.current = event.target.value)}
          />
        </div>
        <div>
          {/* TODO this is not shown*/}
          <input
            style={{ opacity: 0, pointerEvents: 'none' }} // Hide visually and disable clicks
            aria-hidden="true" // Hide for accessibility tools
            type="password"
            id="encrypted-keys"
            autoComplete="current-password"
            name="password"
            value={encryptedKeystore.current}
            onChange={event => setEncryptedKeystore(event.target.value)}
          />
        </div>
        <button id="create-account-button" type="button" onClick={handleGeneratePassword}>
          {GENERATE_ACCOUNT_STRING}
        </button>
        <button
          id="connect-button"
          type="submit"
          onClick={() => connect(userPassword.current, encryptedKeystore.current)}
        >
          Connect
        </button>
      </form>
      {showWarning && (
        <div className="warning-toast">
          {/* TODO implement warning-toast */}
          There is already a password in the field. Please clear the field before generating a new password.
        </div>
      )}
    </>
  );
}
