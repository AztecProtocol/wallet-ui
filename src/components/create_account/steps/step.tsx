import style from "./step.module.scss";

interface StepProps {
  header: string;
  subtitle: string;
  fields: React.ReactNode;
}

export function Step(props: StepProps) {
  return (
    <>
      <div className={style.header}>
        {props.header}
        {/*<div className={style.subtitle}>{props.subtitle}</div>*/}
      </div>
      <div className={style.fields}>{props.fields}</div>
    </>
  );
}
