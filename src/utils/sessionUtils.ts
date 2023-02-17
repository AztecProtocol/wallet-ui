import { AztecBuffer, AztecKeyStore, BarretenbergWasm, Permission } from '@ludamad-aztec/sdk';
import { SessionTypes } from '@walletconnect/types';
import { safeJsonParse, safeJsonStringify } from 'safe-json-utils';

const AZTEC_WALLET_PREFIX = 'aztec-wallet:';

function getKey(key: string) {
  return AZTEC_WALLET_PREFIX + key;
}

export function getCachedEncryptedKeystore() {
  return localStorage.getItem(getKey('encryptedKeystore'));
}

export function setCachedEncryptedKeystore(encryptedKeystore: string) {
  return localStorage.setItem(getKey('encryptedKeystore'), encryptedKeystore);
}

export async function keyStoreToString(keyStore: AztecKeyStore) {
  const { accountPrivateKey, spendingPrivateKey } = await keyStore.rawExport();
  return safeJsonStringify([accountPrivateKey.toString('hex'), spendingPrivateKey.toString('hex')]);
}

export function stringToKeyStore(stringifiedKeyStore: string, wasm: BarretenbergWasm, permissions: Permission[]) {
  const [accountKey, spendingKey] = safeJsonParse<[string, string]>(stringifiedKeyStore);

  return AztecKeyStore.fromPrivateKeys(
    AztecBuffer.from(accountKey, 'hex'),
    AztecBuffer.from(spendingKey, 'hex'),
    wasm,
    permissions,
  );
}

export function setCachedPassword(password: string) {
  return localStorage.setItem(getKey('password'), password);
}

export function getCachedPassword() {
  return localStorage.getItem(getKey('password'));
}

export function storeSession(session: SessionTypes.Struct, key: string) {
  return localStorage.setItem(getKey(`session:${session.topic}`), safeJsonStringify({ session, key }));
}

export function getSession(topic: string) {
  const storedSession = localStorage.getItem(getKey(`session:${topic}`));
  if (!storedSession) {
    return null;
  }
  const parsed = safeJsonParse<{ session: SessionTypes.Struct; key: string }>(storedSession);
  if (typeof parsed === 'string') {
    return null;
  }
  return parsed;
}

export function deleteSession(topic: string) {
  return localStorage.removeItem(getKey(`session:${topic}`));
}
