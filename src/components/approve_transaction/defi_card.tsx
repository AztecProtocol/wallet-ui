import style from './defi_card.module.scss';

interface DefiCardProps {
  bridgeId: number;
  inputAssets: string[];
  outputAssets: string[];
}

interface KeyValuePair {
  key: string;
  value: string;
}

export function DefiCard(props: DefiCardProps) {
  const pairs: KeyValuePair[] = [
    { key: 'Bridge ID', value: props.bridgeId.toString() },
    ...props.inputAssets.map((assetId, index, array) => ({
      key: array.length > 1 ? `Input Asset ${String.fromCharCode(65 + index)}` : 'Input Asset',
      value: assetId.toString(),
    })),
    ...props.outputAssets.map((assetId, index, array) => ({
      key: array.length > 1 ? `Output Asset ${String.fromCharCode(65 + index)}` : 'Output Asset',
      value: assetId.toString(),
    })),
  ];

  return (
    <div className={style.container}>
      <div className={style.defiCardContainer}>
        {pairs.map((pair, index) => (
          <div key={index} className={style.item}>
            <div className={style.key}>{pair.key}</div>
            <div className={style.value}>{pair.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
