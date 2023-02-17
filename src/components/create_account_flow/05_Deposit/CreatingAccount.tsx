// @ts-ignore
import { Loader } from '@aztec/aztec-ui';
import { useEffect, useState } from 'react';
import { NextStepResult } from '../../StepCard';
import style from './CreatingAccount.module.scss';
interface CreatingAccountProps {
  onFinish: () => Promise<NextStepResult>;
  finished: boolean;
}
export default function CreatingAccount({ onFinish, finished }: CreatingAccountProps) {
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    if (finished) {
      setIsCreating(false);
      setTimeout(() => {
        onFinish();
      }, 3e3);
    }
  }, [finished]);

  return (
    <div className={style.loader}>
      {isCreating ? (
        <>
          <div>Creating your wallet...</div>
          <Loader />
        </>
      ) : (
        <div>Welcome to Aztec!</div>
      )}
    </div>
  );
}
