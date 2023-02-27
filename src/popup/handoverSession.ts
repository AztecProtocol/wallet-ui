import { AztecKeyStore, KeyStore } from '@aztec/alpha-sdk';
import { IFRAME_HANDOVER_TYPE } from '../iframe/handleHandover.js';
import { getSession, keyStoreToString } from '../utils/sessionUtils.js';

export function getSessionToHandover() {
  const topic = window.handoverSession;
  if (!topic) {
    console.warn('No topic requested');
    return;
  }
  const sessionData = getSession(topic);
  if (!sessionData) {
    console.warn('No sessions found for', topic);
    return;
  }

  return sessionData;
}

export async function isRequestedKeyStore(keyStore: KeyStore) {
  const aztecAccount = window.handoverAztecAccount;
  if (!aztecAccount) {
    return true;
  }
  const accountKey = await keyStore.getAccountKey();
  return accountKey.getPublicKey().toString() === aztecAccount;
}

export async function sendHandoverMessage(keyStore: AztecKeyStore | null) {
  window.opener.postMessage(
    {
      type: IFRAME_HANDOVER_TYPE,
      payload: {
        keyStore: keyStore ? await keyStoreToString(keyStore) : null,
        sessionData: getSessionToHandover(),
      },
    },
    window.location.origin,
  );
  window.close();
}
