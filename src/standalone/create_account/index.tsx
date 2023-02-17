import { AztecKeyStore, ConstantKeyPair, EthAddress, EthereumProvider } from '@aztec/sdk';
import { useContext, useState } from 'react';
import PasscodeAlias from '../../components/create_account_flow/01_PasscodeAlias/PasscodeAlias';
import ConnectWallet from '../../components/create_account_flow/02_ConnectWallet/ConnectWallet';
import Backup from '../../components/create_account_flow/03_Backup/Backup';
import ReenterPasscode from '../../components/create_account_flow/04_ReenterPasscode/ReenterPasscode';
import Deposit from '../../components/create_account_flow/05_Deposit/Deposit';
import { downloadRecoveryKit, generateRecoveryKey } from '../../keystore';
import { AztecSdkContext } from '../../utils/aztecSdkContext';
import { EthereumChainId } from '../../utils/config';
import { setCachedEncryptedKeystore } from '../../utils/sessionUtils';
import { BBWasmContext } from '../../utils/wasmContext';
import createAndExportKeyStore from './createAndExportKeyStore';
import sendRegisterProof, { AssetValue, EthIdentity } from './sendRegisterProof';

export interface CreateAccountProps {
  onAccountCreated: (encryptedKeys: string) => void;
  chainId: EthereumChainId;
}

enum Step {
  _01_PasscodeAlias,
  _02_ConnectWallet,
  _03_BackupKeys,
  _04_ReenterPasscode,
  _05_Deposit,
}

export default function CreateAccount({ onAccountCreated, chainId }: CreateAccountProps) {
  const [userAlias, setUserAlias] = useState('');
  const [passcode, setPasscode] = useState('');
  const [keyStore, setKeyStore] = useState<AztecKeyStore>();
  const [recoveryKey, setRecoveryKey] = useState<ConstantKeyPair>();
  const [encryptedKeyStore, setEncryptedKeyStore] = useState<string>();
  const [currentStep, setCurrentStep] = useState(Step._01_PasscodeAlias);
  const wasm = useContext(BBWasmContext)!;

  const { sdk } = useContext(AztecSdkContext);

  if (!sdk) {
    return <div>Starting the SDK...</div>;
  }

  const onBack = () => setCurrentStep(currentStep - 1);
  const onNext = () => setCurrentStep(currentStep + 1);

  // We want to remember passcode and alias, so unmount only the visual display, not the state hooks
  const renderPasscodeAlias = () => (
    <PasscodeAlias
      mounted={currentStep === Step._01_PasscodeAlias}
      isValidAlias={(alias: string) => {
        return alias.length > 0; // TODO better alias validation
      }}
      isValidPasscode={(passcode: string) => {
        return passcode.length > 0; // TODO better passcode validation
      }}
      onFinish={async (passcode, alias) => {
        if (await sdk.isAliasRegistered(alias, true)) {
          return { error: `Alias ${alias} already registered!` };
        }
        setPasscode(passcode);
        setUserAlias(alias);
        onNext();
        return undefined;
      }}
    />
  );
  const renderStep = () => {
    switch (currentStep) {
      // case 1 is handled above
      case Step._02_ConnectWallet:
        return (
          <ConnectWallet
            onBack={onBack}
            onFinish={async () => {
              onNext();
            }}
            generateEncryptionKey={async function (recoveryKey: ConstantKeyPair) {
              const { keyStore, encryptedKeyStore } = await createAndExportKeyStore(recoveryKey!, passcode, wasm);
              setKeyStore(keyStore);
              setEncryptedKeyStore(encryptedKeyStore);
              return encryptedKeyStore;
            }}
            generateRecoveryKey={async function (signMessage: () => Promise<`0x${string}`>) {
              const keyPair = await generateRecoveryKey(await signMessage(), wasm);
              setRecoveryKey(keyPair);
              return keyPair;
            }}
          />
        );
      case Step._03_BackupKeys:
        return (
          <Backup
            onBack={onBack}
            onFinish={async () => {
              onNext();
            }}
            doDownloadKey={async function () {
              // TODO download functionality for encrypted keys
            }}
            doDownloadRecoveryKit={async function () {
              await downloadRecoveryKit(keyStore!, recoveryKey!, userAlias);
            }}
          />
        );
      case Step._04_ReenterPasscode:
        return (
          <ReenterPasscode
            onBack={onBack}
            onFinish={async () => {
              onNext();
            }}
            isSamePasscode={(reenteredPasscode: string) => {
              return passcode === reenteredPasscode;
            }}
          />
        );
      case Step._05_Deposit:
        return (
          <Deposit
            onBack={onBack}
            onFinish={async () => {
              onAccountCreated(encryptedKeyStore!);
            }}
            getInitialRegisterFees={() => sdk.getRegisterFees(0)}
            chainId={chainId}
            sendProof={async function (
              ethDeposit: string,
              registerFee: AssetValue,
              depositor: EthIdentity,
              setLog: (msg: string) => void,
            ) {
              await sendRegisterProof({
                sdk: sdk!,
                keyStore: keyStore!,
                registerFee,
                ethDeposit,
                alias: userAlias,
                depositor,
                updateLog: setLog,
              });
              setCachedEncryptedKeystore(encryptedKeyStore!);
            }}
          />
        );
    }
    return null;
  };
  return (
    <>
      {renderPasscodeAlias()}
      {renderStep()}
    </>
  );
}
