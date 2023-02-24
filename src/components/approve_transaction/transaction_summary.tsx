import {
  AztecSdk,
  ProofId,
  ProofRequestData,
  ProofRequestDataType,
  EthAddress,
  PaymentProofRequestData,
  AccountProofRequestData,
  DefiProofRequestData,
  GrumpkinAddress,
  AliasHash,
} from '@aztec/sdk-incubator';
import { useContext } from 'react';
import { AssetValue } from '../../utils/assets';
import { ToastsContext } from '../../utils/toastsContext';
import { DefiCard } from './defi_card';
import style from './transaction_summary.module.scss';

interface KeyValuePair {
  key: string;
  value: AssetValue | AssetValue[] | GrumpkinAddress | EthAddress | string;
  highlight?: boolean;
}

function assetIdToSymbol(assetId: number, sdk: AztecSdk) {
  return sdk.isVirtualAsset(assetId) ? 'Virtual asset' : sdk.getAssetInfo(assetId).symbol;
}

function assetValueToString(assetValue: AssetValue, sdk: AztecSdk) {
  return `${sdk.fromBaseUnits(assetValue)} ${assetIdToSymbol(assetValue.assetId, sdk)}`;
}

function mergeTotalCost(amounts: AssetValue[]) {
  const totalAmounts = amounts.reduce((acc: AssetValue[], amount: AssetValue) => {
    const existingAmount = acc.find(a => a.assetId === amount.assetId);
    if (existingAmount) {
      existingAmount.value += amount.value;
    } else {
      acc.push({ ...amount });
    }
    return acc;
  }, []);

  return {
    key: 'Total Cost',
    value: totalAmounts,
    highlight: true,
  };
}

function generatePaymentProofSummary(requestData: PaymentProofRequestData) {
  return [
    { key: 'Transaction Type', value: requestData.proofId === ProofId.WITHDRAW ? 'Withdraw' : 'Send' },
    {
      key: 'Send to',
      value: requestData.proofId === ProofId.WITHDRAW ? requestData.publicOwner : requestData.recipient,
    },
    { key: 'Amount', value: requestData.assetValue },
    { key: 'Transaction Fee', value: requestData.fee },
    mergeTotalCost([requestData.assetValue, requestData.fee]),
  ];
}

function generateAccountProofSummary(requestData: AccountProofRequestData) {
  const isAccountCreation = requestData.spendingKeyAccount.aliasHash.equals(AliasHash.ZERO);
  const data: KeyValuePair[] = [
    { key: 'Operation', value: isAccountCreation ? 'Account creation' : 'Account update' },
    { key: 'Account alias', value: requestData.alias },
  ];

  if (!requestData.accountPublicKey.equals(requestData.newAccountPublicKey)) {
    data.push({ key: 'New account key', value: requestData.newAccountPublicKey });
  }

  if (!requestData.newSpendingPublicKey1.equals(GrumpkinAddress.ZERO)) {
    data.push({ key: 'New spending key', value: requestData.newSpendingPublicKey1 });
  }

  if (!requestData.newSpendingPublicKey2.equals(GrumpkinAddress.ZERO)) {
    data.push({ key: 'New spending key', value: requestData.newSpendingPublicKey2 });
  }

  return data.concat([
    { key: 'Transaction Fee', value: requestData.fee },
    { key: 'Total Cost', value: requestData.fee, highlight: true },
  ]);
}

function generateDefiProofSummary(requestData: DefiProofRequestData) {
  const {
    assetValue: { value },
    bridgeCallData,
  } = requestData;

  const inputAssetValues: AssetValue[] = [{ assetId: bridgeCallData.inputAssetIdA, value }];
  if (bridgeCallData.secondInputInUse) {
    inputAssetValues.push({ assetId: bridgeCallData.inputAssetIdB!, value });
  }

  return [
    { key: 'Amount', value: inputAssetValues },
    { key: 'Transaction Fee', value: requestData.fee },
    mergeTotalCost([...inputAssetValues, requestData.fee]),
  ];
}

function generateDefiCard(requestData: DefiProofRequestData, sdk: AztecSdk) {
  const { bridgeCallData } = requestData;
  const inputAssetIds = bridgeCallData.secondInputInUse
    ? [bridgeCallData.inputAssetIdA, bridgeCallData.inputAssetIdB!]
    : [bridgeCallData.inputAssetIdA];

  const outputAssetIds = bridgeCallData.secondOutputInUse
    ? [bridgeCallData.outputAssetIdA, bridgeCallData.outputAssetIdB!]
    : [bridgeCallData.outputAssetIdA];
  return (
    <DefiCard
      bridgeId={bridgeCallData.bridgeAddressId}
      inputAssets={inputAssetIds.map(id => assetIdToSymbol(id, sdk))}
      outputAssets={outputAssetIds.map(id => assetIdToSymbol(id, sdk))}
    />
  );
}

function renderValue(
  value: AssetValue | AssetValue[] | GrumpkinAddress | EthAddress | string,
  sdk: AztecSdk,
  showToast: () => void,
) {
  if (Array.isArray(value)) {
    return value.map((assetValue, index) => (
      <div key={index} className={style.assetValueItem}>
        {assetValueToString(assetValue, sdk)}
      </div>
    ));
  }
  if (typeof value === 'object' && 'assetId' in value) {
    return assetValueToString(value, sdk);
  }
  if (value instanceof GrumpkinAddress || value instanceof EthAddress) {
    const strValue = value.toString();
    return (
      <div
        style={{ cursor: 'pointer' }}
        onClick={async () => {
          navigator.clipboard.writeText(strValue);
          showToast();
        }}
      >
        {strValue.substring(0, 5)}...{strValue.substring(strValue.length - 4)} (click to copy)
      </div>
    );
  }
  return value;
}

function SummaryTable({ data, sdk }: { data: KeyValuePair[]; sdk: AztecSdk }) {
  const setToasts = useContext(ToastsContext);

  const showToast = () => {
    setToasts((prevToasts: any) => [
      ...prevToasts,
      {
        text: 'Address copied to clipboard.',
        key: Date.now(),
        autocloseInMs: 5e3,
        closable: true,
      },
    ]);
  };

  return (
    <table className={style.table}>
      <tbody>
        {data.map((pair, index) => (
          <tr key={index}>
            <td className={pair.highlight ? style.highlightTableCell : ''}>{pair.key}</td>
            <td className={pair.highlight ? style.highlightTableCell : ''}>
              {renderValue(pair.value, sdk, showToast)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TransactionSummary({ requestData, sdk }: { requestData: ProofRequestData; sdk: AztecSdk }) {
  let data: KeyValuePair[];
  let card: React.ReactNode = null;

  switch (requestData.type) {
    case ProofRequestDataType.PaymentProofRequestData:
      data = generatePaymentProofSummary(requestData);
      break;
    case ProofRequestDataType.AccountProofRequestData:
      data = generateAccountProofSummary(requestData);
      break;
    case ProofRequestDataType.DefiProofRequestData:
      card = generateDefiCard(requestData, sdk);
      data = generateDefiProofSummary(requestData);
      break;
  }

  return (
    <div className={style.container}>
      {card}
      <SummaryTable data={data} sdk={sdk} />
    </div>
  );
}
