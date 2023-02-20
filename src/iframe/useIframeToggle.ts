import { WalletConnectAztecWalletProviderServer } from '@aztec/sdk';
import { useEffect, useState } from 'react';

const MIN_TIME_OPEN = 500;

async function changeOpenState(server: WalletConnectAztecWalletProviderServer, openState: boolean) {
  if (openState) {
    console.log('Opening iframe');
    await server.openIframe();
  } else {
    console.log('Closing iframe');
    await server.closeIframe();
  }
}

export function useIframeToggle(server: WalletConnectAztecWalletProviderServer) {
  const [nextStateChange, setNextStateChange] = useState<boolean | null>(null);
  const [currentStateChange, setCurrentStateChange] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, MIN_TIME_OPEN);
  }, []);

  useEffect(() => {
    if (isReady && nextStateChange !== null && currentStateChange === null) {
      setCurrentStateChange(nextStateChange);
      setNextStateChange(null);
    }
  }, [isReady, nextStateChange, currentStateChange]);

  useEffect(() => {
    if (currentStateChange !== null) {
      changeOpenState(server, currentStateChange).then(() => {
        console.log('Finished open/close operation', currentStateChange);
        setCurrentStateChange(null);
      });
    }
  }, [currentStateChange]);

  return {
    setIframeOpen(open: boolean) {
      console.log('Requested open/close operation', open);
      setNextStateChange(open);
    },
  };
}
