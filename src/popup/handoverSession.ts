import { AztecKeyStore } from '@aztec/sdk';
import { IFRAME_HANDOVER_TYPE } from '../iframe/handleHandover.js';
import { getSession, keyStoreToString } from '../utils/sessionUtils.js';

function handoverSession(topic: string) {
  const sessionData = getSession(topic);
  if (!sessionData) {
    console.warn('No sessions found for', topic);
    return;
  }

  return sessionData;
}

export async function sendHandoverMessage(keyStore: AztecKeyStore) {
  window.opener.postMessage(
    {
      type: IFRAME_HANDOVER_TYPE,
      payload: {
        keyStore: await keyStoreToString(keyStore),
        sessionData: window.handoverSession ? handoverSession(window.handoverSession) : undefined,
      },
    },
    window.location.origin,
  );
  window.close();
}
