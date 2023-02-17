// @ts-ignore
import { Loader } from '@aztec/aztec-ui';
import { useEffect, useState } from 'react';
import { NextStepResult } from '../../StepCard';
import style from './CreatingAccount.module.scss';
interface CreatingAccountProps {
  onFinish: () => Promise<NextStepResult>;
  finished: boolean;
  log?: string;
}
export default function CreatingAccount({ onFinish, finished, log }: CreatingAccountProps) {
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
          <div style={{ fontSize: 12 }}>{log}</div>
          <Loader />
        </>
      ) : (
        <div>Welcome to Aztec!</div>
      )}
    </div>
  );
}
