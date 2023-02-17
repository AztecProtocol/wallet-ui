import { AztecKeyStore, AztecSdk } from '@aztec/sdk';
import { useContext, useState } from 'react';
import { NextStepResult } from '../../components/StepCard';
import { AztecSdkContext } from '../../utils/aztecSdkContext';
import { EthereumChainId } from '../../utils/config';
import PasscodeAlias from './steps/01_PasscodeAlias/PasscodeAlias';
import ConnectWallet from './steps/02_ConnectWallet/ConnectWallet';
import Backup from './steps/03_Backup/Backup';
import ReenterPasscode from './steps/04_ReenterPasscode/ReenterPasscode';
import Deposit from './steps/05_Deposit/Deposit';

export interface CreateAccountProps {
  onAccountCreated: () => void;
  chainId: EthereumChainId;
}

export default function CreateAccount({ onAccountCreated, chainId }: CreateAccountProps) {
  const [userAlias, setUserAlias] = useState('');
  const [passcode, setPasscode] = useState('');
  const [keyStore, setKeyStore] = useState<AztecKeyStore>();
  const [encryptedKeyStore, setEncryptedKeyStore] = useState<string>();
  const [currentStep, setCurrentStep] = useState(0);

  const { sdk } = useContext(AztecSdkContext);

  if (!sdk) {
    return <div>Starting the SDK...</div>;
  }

  const onBack = () => setCurrentStep(currentStep - 1);
  const onNext = () => setCurrentStep(currentStep + 1);

  // We want to remember passcode and alias, so unmount only the visual display, not the state hooks
  const renderPasscodeAlias = () => (
    <PasscodeAlias
      mounted={currentStep === 0}
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
      // case 0 is handled above
      case 1:
        return (
          <ConnectWallet
            onBack={onBack}
            onFinish={async () => {
              onNext();
            }}
          />
        );
      case 2:
        return (
          <Backup
            onBack={onBack}
            onFinish={async () => {
              onNext();
            }}
            doDownloadKey={async function () {
              // TODO download functionality
            }}
          />
        );
      case 3:
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
      case 4:
        return (
          <Deposit
            onBack={onBack}
            onFinish={async () => {
              onAccountCreated();
            }}
            getInitialRegisterFees={() => sdk.getRegisterFees(0)}
            chainId={chainId}
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
