import { RadioButtonOption } from '@aztec/aztec-ui';
import { AztecSdk } from '@aztec/sdk';

// Importing these types from the sdk is broken
export interface AssetValue {
  assetId: number;
  value: bigint;
}

export enum TxSettlementTime {
  NEXT_ROLLUP,
  INSTANT,
}

export function mapFeesToFeeOptions(sdk: AztecSdk, fees: AssetValue[]): RadioButtonOption<TxSettlementTime>[] {
  return [
    {
      id: TxSettlementTime.NEXT_ROLLUP,
      content: { label: 'Default speed', feeAmountStr: sdk.fromBaseUnits(fees[0], true) },
    },
    {
      id: TxSettlementTime.INSTANT,
      content: { label: 'Fastest speed', feeAmountStr: sdk.fromBaseUnits(fees[1], true) },
    },
  ];
}
