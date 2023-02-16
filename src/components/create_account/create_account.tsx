import { useState } from "react";
// @ts-ignore
import { Button, ButtonTheme, Card, CardHeaderSize } from "aztec-ui";
import {
  Backup,
  ConnectWallet,
  Deposit,
  PasscodeAlias,
  ReenterPasscode,
} from "./steps";
import { CreatingAccount } from "./steps/creating_account";
import style from "./create_account.module.scss";

enum Steps {
  PasscodeAlias,
  ConnectWallet,
  Backup,
  ReenterPasscode,
  Deposit,
  Creating,
}

function renderStep(step: Steps) {
  switch (step) {
    case Steps.PasscodeAlias:
      return <PasscodeAlias />;
    case Steps.ConnectWallet:
      return <ConnectWallet />;
    case Steps.Backup:
      return <Backup />;
    case Steps.ReenterPasscode:
      return <ReenterPasscode />;
    case Steps.Deposit:
      return <Deposit />;
    case Steps.Creating:
      return <div />;
  }
}

export function CreateAccount() {
  const [step, setStep] = useState(0);

  const handlePreviousPage = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleNextPage = () => {
    setStep((prevStep) => prevStep + 1);
  };

  if (step === Steps.Creating) {
    return <CreatingAccount />;
  }

  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.MEDIUM}
      gradient={["#f6f6f6", "#f6f6f6"]}
      headerTextColor="black"
      cardHeader="Account Creation"
      cardContent={
        <form>
          <div className={style.cardContent}>
            {renderStep(step)}
            <div className={style.buttons}>
              {step > 0 ? (
                <Button
                  className={style.nextButton}
                  theme={ButtonTheme.Secondary}
                  onClick={handlePreviousPage}
                  text="Back"
                />
              ) : (
                <div />
              )}
              <Button
                className={style.nextButton}
                theme={ButtonTheme.Primary}
                onClick={handleNextPage}
                text="Next"
              />
            </div>
          </div>
        </form>
      }
    />
  );
}
