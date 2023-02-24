import { EthAddress, EthereumProvider, EthersAdapter } from '@aztec/sdk-incubator';
import { useMemo } from 'react';
import { useAccount, useSigner } from 'wagmi';

export function useActiveWalletEthAddress() {
  const { address, isConnected } = useAccount();
  const ethAddress = useMemo<EthAddress | undefined>(() => {
    if (!isConnected || !address) return;
    return EthAddress.fromString(address);
  }, [address, isConnected]);
  return ethAddress;
}

export function useActiveWalletEthSigner() {
  const ethAddress = useActiveWalletEthAddress();
  const { data: ethersSigner } = useSigner();
  const ethSigner = useMemo<EthereumProvider | undefined>(() => {
    // We check for a connected address so we know the signer isn't a fallback provider
    if (ethAddress && ethersSigner) {
      return new EthersAdapter(ethersSigner.provider!);
    }
  }, [ethAddress, ethersSigner]);
  return { ethAddress, ethSigner };
}
