// @ts-ignore
import { Field, Layer } from '@aztec/aztec-ui';
import { AztecSdk, AztecKeyStore, EthAddress, EthereumProvider } from '@aztec/sdk';
import { useEffect, useState } from 'react';
import StepCard, { NextStepResult } from '../../../../components/StepCard';
import { EthereumChainId } from '../../../../utils/config';
import { chainIdToNetwork } from '../../../../utils/networks';
import CreatingAccount from './CreatingAccount';

const assetOptions = [
  { value: 0, label: 'ETH' },
  { value: 1, label: 'DAI' },
  { value: 2, label: 'USDC' },
  { value: 2, label: 'USDT' },
];

const feeOptions = [
  {
    id: 0,
    content: {
      label: 'Slow',
      timeStr: '10 hours',
      feeAmountStr: '0.00031 ETH',
      feeBulkPriceStr: '$10.40',
    },
  },
  {
    id: 1,
    content: {
      label: 'Instant',
      timeStr: '7 minutes',
      feeAmountStr: '0.0061 ETH',
      feeBulkPriceStr: '$205.36',
    },
  },
];

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

interface DepositProps {
  onBack?: () => void;
  getInitialRegisterFees(): Promise<AssetValue[]>;
  chainId: EthereumChainId;
  // Disabled if send proof is undefined, e.g. if a component is loading
  sendProof?: (ethDeposit: string, registerFees: AssetValue[]) => void;
  onFinish: () => Promise<NextStepResult>;
}

export default function Deposit({ chainId, getInitialRegisterFees, sendProof, onFinish, onBack }: DepositProps) {
  const [ethDeposit, setEthDeposit] = useState<string>('0');
  const [sendingProof, setSendingProof] = useState<boolean>(false);
  const [registerFees, setRegisterFees] = useState<AssetValue[]>();
  const [sendingProofFinished, setSendingProofFinished] = useState<boolean>(false);

  useEffect(() => {
    getInitialRegisterFees().then(setRegisterFees);
  }, []);
  if (sendingProof) {
    return <CreatingAccount onFinish={onFinish} finished={sendingProofFinished} />;
  }
  return (
    <StepCard
      nextButtonDisabled={sendingProof || !registerFees || !sendProof}
      handlePreviousStep={onBack}
      handleNextStep={async () => {
        setSendingProof(true);
        await sendProof!(ethDeposit, registerFees!);
        return await onFinish();
      }}
      header={'Make your First Deposit'}
    >
      {/* <input value={ethDeposit} onChange={event => setEthDeposit(event.target.value)} /> */}
      <Field
        label={'Deposit Amount (optional)'}
        value={ethDeposit}
        balance={ethDeposit}
        layer={Layer.L1}
        selectedAsset={{ symbol: 'ETH', id: 0 }}
        onChangeValue={setEthDeposit}
        onClickMax={() => console.log('Clicked balance indicator')}
        allowAssetSelection={true}
        assetOptions={assetOptions}
      />
      <h2>Gas fee</h2>
      <input
        disabled={true}
        value={registerFees ? getFee(registerFees, chainId).value.toString() : 'Loading...'}
      ></input>
      {/* TODO real fee selection */}
      {/* <FeeSelector
            value={0}
            label={"Gas Fee"}
            placeholder={"Placeholder"}
            options={feeOptions}
            onChangeValue={() => {}}
          /> */}
    </StepCard>
  );
}
