import { AztecSdk, AztecKeyStore, EthAddress, EthereumProvider } from '@aztec/sdk';
import { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useActiveWalletEthSigner } from '../../utils/activeWalletHooks';

// Ideally we want to get this from bb.js
interface AssetValue {
  assetId: number;
  value: bigint;
}

async function sendProof(
  sdk: AztecSdk,
  keyStore: AztecKeyStore,
  depositFee: AssetValue[],
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
    depositFee[1],
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
  // console.log(`awaiting settlement...`);
  // await controller.awaitSettlement();
  console.log(`done!`);
}

export function RegisterAccount(props: {
  sdk: AztecSdk;
  userAlias: string;
  keyStore: AztecKeyStore;
  onFinish: () => void;
}) {
  const [ethDeposit, setEthDeposit] = useState<string>('0');
  const [depositFee, setDepositFee] = useState<AssetValue[] | null>(null);
  const [sendingProof, setSendingProof] = useState<boolean>(false);

  const ethAccount = useAccount();
  const ethBalance = useBalance({ address: ethAccount.address });

  const { ethAddress, ethSigner } = useActiveWalletEthSigner();

  useEffect(() => {
    props.sdk.getRegisterFees(0).then(setDepositFee);
  }, []);

  return (
    <div>
      <h1>Make a deposit & select a gas fee</h1>
      <h2>Deposit amount (optional) Current balance: {ethBalance.data?.formatted}</h2>
      <input value={ethDeposit} onChange={event => setEthDeposit(event.target.value)} />
      <h2>Gas fee</h2>
      <input disabled={true} value={depositFee?.[0].value.toString() || 'Loading...'} />
      <br />
      <button
        disabled={sendingProof || !depositFee || !ethAddress || !ethSigner}
        onClick={() => {
          setSendingProof(true);
          sendProof(props.sdk, props.keyStore, depositFee!, ethDeposit, props.userAlias, ethAddress!, ethSigner!).then(
            props.onFinish,
          );
        }}
      >
        Deposit and create wallet
      </button>
    </div>
  );
}
