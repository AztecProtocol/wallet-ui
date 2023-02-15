import {
  EthereumProvider,
  EthAddress,
  AztecKeyStore,
  PrivateKeys,
  decryptPrivateKeys,
  WalletProvider,
  AztecBuffer,
} from '@aztec/sdk';
import { useEffect, useState } from 'react';
import ConnectAccount from '../components/ConnectAccount';
import render from '../components/render';
import getWasm from '../utils/getWasm';
import { createFundedWalletProvider } from './createFundedWalletProvider';

async function generateEncryptedKeystoreFieldInput(
  provider: EthereumProvider,
  address: EthAddress,
  userPassword: string,
): Promise<string> {
  const keyStore = await AztecKeyStore.create(await getWasm());

  const encryptedKeystore = await keyStore.export(userPassword, provider, address);
  return encryptedKeystore.toString('hex');
}

async function decryptEncryptedKeystoreFieldInput(
  userPassword: string,
  encryptedKeystore: string,
): Promise<PrivateKeys> {
  return await decryptPrivateKeys(AztecBuffer.from(encryptedKeystore, 'hex'), userPassword);
}

const USER_PASSWORD_KEY = 'user-keys';
const ENCRYPTED_KEYS_KEY = 'encrypted-keys';
const ORIGIN = '*'; // TODO add origin environment flags

function DebugApp() {
  const [ethereumProvider, setEthereumProvider] = useState<WalletProvider>();
  useEffect(() => {
    createFundedWalletProvider()
      .then(setEthereumProvider)
      .catch(() => {});
  }, []);
  if (!ethereumProvider) {
    return <div>Loading...</div>;
  }
  return (
    <ConnectAccount
      generateEncryptedKeystore={async (userPassword: string) => {
        const encryptedKeystore = await generateEncryptedKeystoreFieldInput(
          ethereumProvider,
          ethereumProvider.getAccount(0),
          userPassword,
        );
        window.localStorage.setItem(ENCRYPTED_KEYS_KEY, encryptedKeystore);
        return encryptedKeystore;
      }}
      initialEncryptedKeystore={window.localStorage.getItem(ENCRYPTED_KEYS_KEY)}
      initialUserPassword={window.localStorage.getItem(USER_PASSWORD_KEY)}
      connect={async (userPassword: string, encryptedKeystore: string) => {
        const keys = await decryptEncryptedKeystoreFieldInput(userPassword, encryptedKeystore);
        window.opener.postMessage(
          {
            fn: 'resolvePrivateKeys',
            args: [keys.accountKey, keys.spendingKey],
          },
          ORIGIN,
        );
      }}
    />
  );
}

render(<DebugApp />);
