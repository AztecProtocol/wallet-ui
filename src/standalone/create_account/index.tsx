import { AztecKeyStore, ConstantKeyPair, EthAddress, EthereumProvider } from '@aztec/sdk';
import { useContext, useState } from 'react';
import PasscodeAlias from '../../components/create_account_flow/01_PasscodeAlias/PasscodeAlias';
import ConnectWallet from '../../components/create_account_flow/02_ConnectWallet/ConnectWallet';
import Backup from '../../components/create_account_flow/04_Backup/Backup';
import ReenterPasscode from '../../components/create_account_flow/05_ReenterPasscode/ReenterPasscode';
import Deposit from '../../components/create_account_flow/06_Deposit/Deposit';
import { downloadRecoveryKit, generateRecoveryKey } from '../../keystore';
import { AztecSdkContext } from '../../utils/aztecSdkContext';
import { EthereumChainId } from '../../utils/config';
import { BBWasmContext } from '../../utils/wasmContext';
import { createAndExportKeyStore } from './keyStoreCreation';
import sendProof, { AssetValue } from './sendProof';

export interface CreateAccountProps {
  onAccountCreated: () => void;
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
              return encryptedKeyStore;
            }}
            generateRecoveryKey={async function (signMessage: () => Promise<`0x${string}`>) {
              const keyPair = await generateRecoveryKey(await signMessage(), wasm);
              setRecoveryKey(keyPair);
              return keyPair;
            }}
          />
        );
      // case Step._03_RecoveryKey:
      //   return (
      //     <RecoveryKit
      //       onBack={onBack}
      //       onFinish={async () => {
      //         onNext();
      //       }}
      //       downloadRecoveryKit={async function () {
      //         // TODO download functionality
      //       }}
      //       generateRecoveryKey={async function () {}}
      //     />
      //   );
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
              onAccountCreated();
            }}
            getInitialRegisterFees={() => sdk.getRegisterFees(0)}
            chainId={chainId}
            sendProof={async function (
              ethDeposit: string,
              registerFee: AssetValue,
              depositorAddress: EthAddress,
              depositorSigner: EthereumProvider,
            ) {
              await sendProof(sdk!, keyStore!, registerFee, ethDeposit, userAlias, depositorAddress, depositorSigner);
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

// switch (currentStep) {
//   case 'PasscodeAlias':
//     return <PasscodeAlias isValidAlias={(alias: string) => {
//       return alias.length > 0; // TODO better alias validation
//     }} isValidPasscode={(passcode: string) => {
//       return passcode.length > 0; // TODO better passcode validation
//     }} onFinish={async (passcode, alias) => {
//       if (await sdk.isAliasRegistered(alias)) {
//         return {error: `Alias ${alias} already registered!`};
//       }
//       setPasscode(passcode);
//       setUserAlias(alias);
//       setCurrentStep("ConnectWallet")
//       return undefined;
//     }} />;
//   case 'ConnectWallet':
//     return <ConnectWallet onFinish={}/>;
//   case 'Backup':
//     return <Backup />;
//   case 'ReenterPasscode':
//     return <ReenterPasscode />;
//   case 'Deposit':
//     return <Deposit />;
//   case 'Creating':
//     return <div />;
// }
// return <Card
//   className={style.card}
//   headerSize={CardHeaderSize.MEDIUM}
//   gradient={['#f6f6f6', '#f6f6f6']}
//   headerTextColor="black"
//   cardHeader="Account Creation"
//   cardContent={
//     <form>
//       <div className={style.cardContent}>
//         {renderStep(step)}
//         <div className={style.buttons}>
//           {handlePreviousStep && (
//             <Button
//               className={style.nextButton}
//               theme={ButtonTheme.Secondary}
//               onClick={handlePreviousStep}
//               text="Back"
//             />
//           )}
//           <Button className={style.nextButton} theme={ButtonTheme.Primary} onClick={handleNextStep} text="Next" />
//         </div>
//       </div>
//     </form>
//   }
// />
// switch (currentStep) {
//   case 'keystoreCreation':
//     return (
//       <CreateAccount step="PasscodeAlias" />
//       // <KeyStoreCreation
//       //   onFinish={(keyStore, encryptedKeyStore) => {
//       //     setKeyStore(keyStore);
//       //     setEncryptedKeyStore(encryptedKeyStore);
//       //     setCurrentStep('aliasSelection');
//       //   }}
//       // />
//     );
//   case 'aliasAndPasscodeSelection':
//     return (
//       <AliasAndPasscodeSelection
//         sdk={sdk}
//         encryptedKeyStore={encryptedKeyStore!}
//         onFinish={userAlias => {
//           setUserAlias(userAlias);
//           setCurrentStep('recoveryKit');
//         }}
//       />
//     );
//   case 'recoveryKit':
//     return <RecoveryKit keyStore={keyStore!} userAlias={userAlias} onFinish={() => setCurrentStep('sanityCheck')} />;
//   case 'sanityCheck':
//     return <SanityCheck keyStore={keyStore!} onFinish={() => setCurrentStep('registerAccount')} />;
//   case 'registerAccount':
//     return (
//       <RegisterAccount
//         sdk={sdk}
//         chainId={props.chainId}
//         keyStore={keyStore!}
//         userAlias={userAlias}
//         onFinish={() => props.onAccountCreated()}
//       />
//     );
