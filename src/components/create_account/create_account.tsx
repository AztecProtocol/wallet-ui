import { useState } from 'react';
// @ts-ignore
import { Button, ButtonTheme, Card, CardHeaderSize } from '@aztec/aztec-ui';
import { Backup, ConnectWallet, Deposit, PasscodeAlias, ReenterPasscode } from '../../standalone/create_account/steps';
import { CreatingAccount } from '../../standalone/create_account/steps/creating_account';
import style from './create_account.module.scss';

export type OnboardingStep = 'PasscodeAlias' | 'ConnectWallet' | 'Backup' | 'ReenterPasscode' | 'Deposit' | 'Creating';

function renderStep(step: OnboardingStep) {
  switch (step) {
    case 'PasscodeAlias':
      return <PasscodeAlias />;
    case 'ConnectWallet':
      return <ConnectWallet />;
    case 'Backup':
      return <Backup />;
    case 'ReenterPasscode':
      return <ReenterPasscode />;
    case 'Deposit':
      return <Deposit />;
    case 'Creating':
      return <div />;
  }
}

interface CreateAccount2Props {
  step: OnboardingStep;
  handleNextStep?: () => void;
  handlePreviousStep?: () => void;
}

export function CreateAccount({ step, handleNextStep, handlePreviousStep }: CreateAccount2Props) {
  if (step === 'Creating') {
    return <CreatingAccount />;
  }

  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.MEDIUM}
      gradient={['#f6f6f6', '#f6f6f6']}
      headerTextColor="black"
      cardHeader="Account Creation"
      cardContent={
        <form>
          <div className={style.cardContent}>
            {renderStep(step)}
            <div className={style.buttons}>
              {handlePreviousStep && (
                <Button
                  className={style.nextButton}
                  theme={ButtonTheme.Secondary}
                  onClick={handlePreviousStep}
                  text="Back"
                />
              )}
              <Button className={style.nextButton} theme={ButtonTheme.Primary} onClick={handleNextStep} text="Next" />
            </div>
          </div>
        </form>
      }
    />
  );
}

// export function CreateAccount() {
//   const [step, setStep] = useState(0);

//   const handlePreviousStep = () => {
//     setStep(prevStep => prevStep - 1);
//   };

//   const handleNextStep = () => {
//     setStep(prevStep => prevStep + 1);
//   };

//   if (step === Steps.Creating) {
//     return <CreatingAccount />;
//   }

//   return (
//     <Card
//       className={style.card}
//       headerSize={CardHeaderSize.MEDIUM}
//       gradient={['#f6f6f6', '#f6f6f6']}
//       headerTextColor="black"
//       cardHeader="Account Creation"
//       cardContent={
//         <form>
//           <div className={style.cardContent}>
//             {renderStep(step)}
//             <div className={style.buttons}>
//               {step > 0 ? (
//                 <Button
//                   className={style.nextButton}
//                   theme={ButtonTheme.Secondary}
//                   onClick={handlePreviousStep}
//                   text="Back"
//                 />
//               ) : (
//                 <div />
//               )}
//               <Button className={style.nextButton} theme={ButtonTheme.Primary} onClick={handleNextStep} text="Next" />
//             </div>
//           </div>
//         </form>
//       }
//     />
//   );
// }
