import { FeeSelector, FeeSelectorStatus, Field, Layer, RadioButtonOption } from '@aztec/aztec-ui';
import { useEffect, useState } from 'react';
import { useBalance } from 'wagmi';

import { EthIdentity } from '../../../standalone/create_account/sendRegisterProof';
import { useActiveWalletEthSigner } from '../../../utils/activeWalletHooks';
import { EthereumChainId } from '../../../utils/config';
import { AssetValue, TxSettlementTime } from '../../../utils/assets';
import { chainIdToNetwork } from '../../../utils/networks';
import StepCard, { NextStepResult } from '../../StepCard';
import CreatingAccount from './CreatingAccount';

interface DepositProps {
  chainId: EthereumChainId;
  onBack?: () => void;
  getInitialRegisterFees(): Promise<{ fees: AssetValue[]; feeOptions: RadioButtonOption<TxSettlementTime>[] }>;
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
  const [registerFees, setRegisterFees] = useState<AssetValue[]>([]);
  const [registerFeeOptions, setRegisterFeeOptions] = useState<RadioButtonOption<TxSettlementTime>[]>([]);
  const [selectedFee, setSelectedFee] = useState<TxSettlementTime>(
    chainIdToNetwork(chainId)?.isFrequent ? TxSettlementTime.INSTANT : TxSettlementTime.NEXT_ROLLUP,
  );
  const [log, setLog] = useState('');
  const [sendingProofFinished, setSendingProofFinished] = useState<boolean>(false);

  const { ethAddress, ethSigner } = useActiveWalletEthSigner();
  const ethBalance = useBalance({ address: ethAddress?.toString() });

  useEffect(() => {
    getInitialRegisterFees().then(({ fees, feeOptions }) => {
      setRegisterFees(fees);
      setRegisterFeeOptions(feeOptions);
    });
  }, []);
  if (sendingProof) {
    return <CreatingAccount log={log} onFinish={onFinish} finished={sendingProofFinished} />;
  }
  return (
    <StepCard
      nextButtonDisabled={sendingProof || !registerFees}
      handlePreviousStep={onBack}
      handleNextStep={async () => {
        try {
          setSendingProof(true);
          await sendProof(ethDeposit, registerFees[selectedFee], { ethAddress, ethSigner }, setLog);
          setSendingProofFinished(true);
        } catch (error) {
          setLog((error as Error).message);
        }
      }}
      header="Make a deposit & select a Transaction fee"
      subtitle="Confirm your details before proceeding"
      steps={5}
      currentStep={5}
    >
      {/* <input value={ethDeposit} onChange={event => setEthDeposit(event.target.value)} /> */}
      <Field
        label="Deposit Amount (optional)"
        value={ethDeposit}
        balance={ethBalance.data?.formatted}
        layer={Layer.L1}
        selectedAsset={{ symbol: 'ETH', id: 0 }}
        onChangeValue={setEthDeposit}
        allowAssetSelection={false}
      />
      <FeeSelector
        placeholder={'Select a speed'}
        label={'Transaction fee'}
        value={selectedFee}
        options={registerFeeOptions}
        status={selectedFee !== null ? FeeSelectorStatus.Success : undefined}
        balance={ethBalance.data?.formatted}
        onChangeValue={setSelectedFee}
      />
    </StepCard>
  );
}
