import { Button, ButtonTheme, Card, CardHeaderSize } from '@aztec/aztec-ui';
import { ReactNode, useContext } from 'react';
import { ToastsContext, addErrorToast } from '../../utils/toastsContext';
import style from './StepCard.module.scss';

export type NextStepResult = { error: string } | void;

interface CreateAccountCardProps {
  children: ReactNode;
  handleNextStep?: () => Promise<NextStepResult>;
  handlePreviousStep?: () => void;
  header: string;
  subtitle?: string;
  nextButtonDisabled?: boolean;
  mounted?: boolean;
}
/**
 * Wrapper for account creation cards with a prev/next button
 * and some content
 */
export default function StepCard({
  children,
  handleNextStep,
  handlePreviousStep,
  header,
  subtitle,
  nextButtonDisabled,
}: CreateAccountCardProps) {
  const setToasts = useContext(ToastsContext);
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
            <div className={style.header}>
              {header}
              {subtitle && <div className={style.subtitle}>{subtitle}</div>}
            </div>
            <div className={style.fields}>{children}</div>
            <div className={style.buttons}>
              {handlePreviousStep && (
                <Button
                  className={style.nextButton}
                  theme={ButtonTheme.Secondary}
                  onClick={handlePreviousStep}
                  text="Back"
                />
              )}
              {handleNextStep && (
                <Button
                  className={style.nextButton}
                  theme={ButtonTheme.Primary}
                  disabled={nextButtonDisabled}
                  onClick={async () => {
                    const error = (await handleNextStep())?.error;
                    if (error) {
                      addErrorToast(error, setToasts);
                    }
                  }}
                  text="Next"
                />
              )}
            </div>
          </div>
        </form>
      }
    />
  );
}
