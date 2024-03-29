import { AztecKeyStore, BarretenbergWasm } from '@aztec/alpha-sdk';
import { SignClient } from '@walletconnect/sign-client/dist/types/client.js';
import { SessionTypes } from '@walletconnect/types';
import getWasm from '../utils/getWasm.js';
import { stringToKeyStore } from '../utils/sessionUtils.js';

export const IFRAME_HANDOVER_TYPE = 'iframe_handover';

export function getTopic() {
  return new URLSearchParams(window.location.search).get('topic');
}

export function getAztecAccount() {
  return new URLSearchParams(window.location.search).get('aztecAccount');
}

export type HandoverResult = { session?: SessionTypes.Struct; keyStore?: AztecKeyStore };

export async function handleHandoverMessage(
  payload: {
    keyStore?: string;
    sessionData?: { session: SessionTypes.Struct; key: string };
  },
  signClient: SignClient,
): Promise<HandoverResult> {
  const keyStore = payload.keyStore ? stringToKeyStore(payload.keyStore, await getWasm(), []) : undefined;
  if (payload.sessionData) {
    // Subscribe to our wallet connect session from the iframe
    const { session, key } = payload.sessionData;
    await signClient.core.crypto.keychain.set(session.self.publicKey, key);
    await signClient.core.crypto.generateSharedKey(session.self.publicKey, session.peer.publicKey);
    await signClient.session.set(session.topic, session);
    await signClient.core.relayer.subscribe(session.topic);
    return { session, keyStore };
  }
  return { keyStore };
}

export function openPopup() {
  const walletWindow = window.open(
    window.location.origin + '/popup',
    '_blank',
    'popup=true,resizable=true,width=800,height=875',
  );
  if (walletWindow) {
    const topic = getTopic();
    if (topic) {
      walletWindow.handoverSession = topic;
    }
    const aztecAccount = getAztecAccount();
    if (aztecAccount) {
      walletWindow.handoverAztecAccount = aztecAccount;
    }
  }
}
