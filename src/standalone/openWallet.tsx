import { useContext, useMemo, useState } from 'react';
import { getCachedCredential } from '../utils/sessionUtils.js';
import { SignIn } from '../components/sign_in/index.js';

export interface OpenWalletProps {
  onCreateAccount: () => void;
}

export default function OpenWallet(props: OpenWalletProps) {
  const cachedEncryptedKeystore = useMemo(() => getCachedCredential(), []);

  return (
    <SignIn
      showEncryptedKeystore={!cachedEncryptedKeystore}
      showCreate={!cachedEncryptedKeystore}
      isValidPasscode={function (passcode: string): boolean {}}
      onCreateAccount={props.onCreateAccount}
      onFinish={async function (userInputEncryptedKeystore: string, passcode: string) {}}
    />
  );
}
