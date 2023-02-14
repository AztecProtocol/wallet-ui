import {
  AztecKeyStore,
  BarretenbergWasm,
  decryptPrivateKeys,
  EthAddress,
  EthereumProvider,
  PrivateKeys,
} from '@aztec/sdk';
import { Web3ReactProvider } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { PrivKeyResolver } from '../keystore/UIKeyStore.js';
import { SendReply, setEventListenerMessageRpc } from '../utils/setEventListenerMessageRpc.js';
import { CreateSpendingKey } from '../views/create_spending_key.js';
import { ConnectAccount } from './connect.js';

export const viewPaths = {
  CREATE_ACCOUNT_KEY: '/create_account_key',
  CREATE_SPENDING_KEY: '/create_spending_key',
  SIGN_MESSAGE: '/sign_message',
};
// TODO review key, should incorporate anything else?
export const ENCRYPTED_KEYS_KEY = 'encrypted-keys';

let wasm: BarretenbergWasm | undefined;

async function generateEncryptedKeystoreFieldInput(
  provider: EthereumProvider,
  address: EthAddress,
  userPassword: string,
): Promise<string> {
  wasm = wasm || (await BarretenbergWasm.new());
  const keyStore = await AztecKeyStore.create(wasm);

  const encryptedKeystore = await keyStore.export(userPassword, provider, address);
  return encryptedKeystore.toString('hex');
}

async function decryptEncryptedKeystoreFieldInput(
  userPassword: string,
  encryptedKeystore: string,
): Promise<PrivateKeys> {
  wasm = wasm || (await BarretenbergWasm.new());
  return await decryptPrivateKeys(Buffer.from(encryptedKeystore, 'hex'), userPassword);
}
interface GetKeystoreProps {
  generateEncryptedKeystore: (userPassword: string) => Promise<string>;
  connect: (userPassword: string, encryptedKeystore: string) => void;
}
function GetKeystore({ generateEncryptedKeystore, connect }: GetKeystoreProps) {
  return (
    <ConnectAccount
      connect={connect}
      initialEncryptedKeystore={window.localStorage.getItem(ENCRYPTED_KEYS_KEY)}
      generateEncryptedKeystore={generateEncryptedKeystore}
    />
  );
}

/**
 * Test-friendly interface that allows setting location
 * @param props initial location array
 */
export function AppWithMemoryRouter(props: AppProps & { initialEntries?: string[] }) {
  return (
    <MemoryRouter initialEntries={props.initialEntries}>
      <App {...props} />
    </MemoryRouter>
  );
}

export const ORIGIN = window.location.origin; // TODO hardcode aztec?
interface AppProps {
  ethereumProvider: EthereumProvider;
  address: EthAddress;
}
export function App({ ethereumProvider, address }: AppProps) {
  const navigate = useNavigate();

  return (
    <Web3ReactProvider getLibrary={provider => provider}>
      <Routes>
        <Route
          path={viewPaths.CREATE_ACCOUNT_KEY}
          element={
            <GetKeystore
              generateEncryptedKeystore={async (userPassword: string) => {
                const encryptedKeystore = await generateEncryptedKeystoreFieldInput(
                  ethereumProvider,
                  address,
                  userPassword,
                );
                window.localStorage.setItem(ENCRYPTED_KEYS_KEY, encryptedKeystore);
                return encryptedKeystore;
              }}
              connect={async (userPassword: string, encryptedKeystore: string) => {
                const keys = await decryptEncryptedKeystoreFieldInput(userPassword, encryptedKeystore);
                window.opener.postMessage(
                  { fn: 'resolvePrivateKeys', args: [keys.accountKey, keys.spendingKey] },
                  ORIGIN,
                );
              }}
            />
          }
        />
        {/* <Route path={viewPaths.CREATE_SPENDING_KEY} element={<CreateSpendingKey privKeyResolve={privKeyResolve} />} /> */}
        {/* <Route path={viewPaths.SIGN_MESSAGE} element={<CreateSpendingKey privKeyResolve={privKeyResolve} />} /> */}
      </Routes>
    </Web3ReactProvider>
  );
}
