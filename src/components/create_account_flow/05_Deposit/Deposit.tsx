import { Field, Layer } from '@aztec/aztec-ui';
import { useEffect, useState } from 'react';
import { useBalance } from 'wagmi';
import { EthIdentity } from '../../../standalone/create_account/sendRegisterProof';
import { useActiveWalletEthSigner } from '../../../utils/activeWalletHooks';
import { EthereumChainId } from '../../../utils/config';
import { chainIdToNetwork } from '../../../utils/networks';
import StepCard, { NextStepResult } from '../../StepCard';
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
  sendProof: (
    ethDeposit: string,
    registerFee: AssetValue,
    ethIdentity: EthIdentity,
    setLog: (msg: string) => void,
  ) => Promise<void>;
  onFinish: () => Promise<NextStepResult>;
}

export default function Deposit({ chainId, getInitialRegisterFees, sendProof, onFinish, onBack }: DepositProps) {
  const [ethDeposit, setEthDeposit] = useState<string>('0');
  const [sendingProof, setSendingProof] = useState<boolean>(false);
  const [registerFees, setRegisterFees] = useState<AssetValue[]>();
  const [log, setLog] = useState('');
  const [sendingProofFinished, setSendingProofFinished] = useState<boolean>(false);
  const { ethAddress, ethSigner } = useActiveWalletEthSigner();

  const ethBalance = useBalance({ address: ethAddress?.toString() });

  useEffect(() => {
    getInitialRegisterFees().then(setRegisterFees);
  }, []);
  if (sendingProof) {
    return <CreatingAccount log={log} onFinish={onFinish} finished={sendingProofFinished} />;
  }
  return (
    <StepCard
      nextButtonDisabled={sendingProof || !registerFees}
      handlePreviousStep={onBack}
      handleNextStep={async () => {
        setSendingProof(true);
        await sendProof!(ethDeposit, getFee(registerFees!, chainId), { ethAddress, ethSigner }, setLog);
        setSendingProofFinished(true);
      }}
      header={'Make your First Deposit'}
    >
      {/* <input value={ethDeposit} onChange={event => setEthDeposit(event.target.value)} /> */}
      <Field
        label={'Deposit Amount (optional)'}
        value={ethDeposit}
        balance={ethBalance.data?.formatted}
        layer={Layer.L1}
        selectedAsset={{ symbol: 'ETH', id: 0 }}
        onChangeValue={setEthDeposit}
        onClickMax={() => setEthDeposit(ethBalance.data?.formatted || '0')}
        allowAssetSelection={false}
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
