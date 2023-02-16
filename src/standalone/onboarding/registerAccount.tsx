import { AztecSdk, AztecKeyStore, EthAddress, EthereumProvider } from '@aztec/sdk';
import { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useActiveWalletEthSigner } from '../../utils/activeWalletHooks';
import { EthereumChainId } from '../../utils/config';
import { chainIdToNetwork } from '../../utils/networks';

// Ideally we want to get this from bb.js
interface AssetValue {
  assetId: number;
  value: bigint;
}

async function sendProof(
  sdk: AztecSdk,
  keyStore: AztecKeyStore,
  registerFee: AssetValue,
  ethDeposit: string,
  alias: string,
  depositorAddress: EthAddress,
  depositorSigner: EthereumProvider,
) {
  const deposit = sdk.toBaseUnits(0, ethDeposit);
  const aztecWalletProvider = await sdk.createAztecWalletProvider(keyStore);
  await aztecWalletProvider.connect();
  const accountPublicKey = await sdk.addAccount(aztecWalletProvider);
  const spendingKey = await aztecWalletProvider.getSpendingPublicKey();
  await sdk.awaitAccountSynchronised(accountPublicKey);

  const controller = sdk.createRegisterController(
    accountPublicKey,
    alias,
    spendingKey,
    undefined,
    deposit,
    registerFee,
    depositorAddress,
    aztecWalletProvider,
    depositorSigner,
  );

  const requiredFunds = await controller.getRequiredFunds();
  if (requiredFunds > 0n) {
    console.log(`depositing funds to contract...`);
    await controller.depositFundsToContract();
    console.log(`awaiting transaction confirmation...`);
    await controller.awaitDepositFundsToContract();
  }
  console.log(`generating proof...`);
  await controller.createProofs();
  console.log(`signing proof...`);
  await controller.sign();
  console.log(`sending proof...`);
  await controller.send();
  console.log(`done!`);
}

function getFee(fees: AssetValue[], chainId: EthereumChainId) {
  const network = chainIdToNetwork(chainId);
  if (network?.isFrequent) {
    // Pay for the whole rollup
    return fees[1];
  }
  return fees[0];
}

export function RegisterAccount(props: {
  sdk: AztecSdk;
  chainId: EthereumChainId;
  userAlias: string;
  keyStore: AztecKeyStore;
  onFinish: () => void;
}) {
  const [ethDeposit, setEthDeposit] = useState<string>('0');
  const [registerFees, setRegisterFees] = useState<AssetValue[] | null>(null);
  const [sendingProof, setSendingProof] = useState<boolean>(false);

  const ethAccount = useAccount();
  const ethBalance = useBalance({ address: ethAccount.address });

  const { ethAddress, ethSigner } = useActiveWalletEthSigner();

  useEffect(() => {
    props.sdk.getRegisterFees(0).then(setRegisterFees);
  }, []);

  return (
    <div>
      <h1>Make a deposit & select a gas fee</h1>
      <h2>Deposit amount (optional) Current balance: {ethBalance.data?.formatted}</h2>
      <input value={ethDeposit} onChange={event => setEthDeposit(event.target.value)} />
      <h2>Gas fee</h2>
      <input
        disabled={true}
        value={registerFees ? getFee(registerFees, props.chainId).value.toString() : 'Loading...'}
      />
      <br />
      <button
        disabled={sendingProof || !registerFees || !ethAddress || !ethSigner}
        onClick={() => {
          setSendingProof(true);
          sendProof(
            props.sdk,
            props.keyStore,
            getFee(registerFees!, props.chainId),
            ethDeposit,
            props.userAlias,
            ethAddress!,
            ethSigner!,
          ).then(props.onFinish);
        }}
      >
        Deposit and create wallet
      </button>
    </div>
  );
}
