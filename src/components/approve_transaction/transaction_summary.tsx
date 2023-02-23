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
import { AssetValue } from '../../utils/assets';
import style from './transaction_summary.module.scss';

interface KeyValuePair {
  key: string;
  value: string;
  highlight?: boolean;
}

function shortEthAddress(address: EthAddress) {
  const stringAddress = address.toString();
  return `${stringAddress.slice(0, 10)}...${stringAddress.slice(-4)}`;
}

function SummaryTable({ data }: { data: KeyValuePair[] }) {
  return (
    <table className={style.table}>
      <tbody>
        {data.map((pair, index) => (
          <tr key={index}>
            <td className={pair.highlight ? style.highlightTableCell : ''}>{pair.key}</td>
            <td className={pair.highlight ? style.highlightTableCell : ''}>{pair.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function assetIdToSymbol(assetId: number, sdk: AztecSdk) {
  return sdk.isVirtualAsset(assetId) ? 'Virtual asset' : sdk.getAssetInfo(assetId).symbol;
}

function assetValueToString(assetValue: AssetValue, sdk: AztecSdk) {
  return `${sdk.fromBaseUnits(assetValue)} ${assetIdToSymbol(assetValue.assetId, sdk)}`;
}

function generateTotalCost(amounts: AssetValue[], sdk: AztecSdk) {
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
    value: totalAmounts.map(amount => assetValueToString(amount, sdk)).join(' + '),
    highlight: true,
  };
}

function renderPaymentProofSummary(requestData: PaymentProofRequestData, sdk: AztecSdk) {
  return [
    requestData.proofId === ProofId.WITHDRAW
      ? { key: 'Withdraw to', value: shortEthAddress(requestData.publicOwner) }
      : { key: 'Send to', value: requestData.recipient.toShortString() },
    { key: 'Amount', value: assetValueToString(requestData.assetValue, sdk) },
    { key: 'Transaction Fee', value: assetValueToString(requestData.fee, sdk) },
    generateTotalCost([requestData.assetValue, requestData.fee], sdk),
  ];
}

function renderAccountProofSummary(requestData: AccountProofRequestData, sdk: AztecSdk) {
  const isAccountCreation = requestData.spendingKeyAccount.aliasHash.equals(AliasHash.ZERO);
  const data: KeyValuePair[] = [
    { key: 'Operation', value: isAccountCreation ? 'Account creation' : 'Account update' },
    { key: 'Account alias', value: requestData.alias },
  ];

  if (!requestData.accountPublicKey.equals(requestData.newAccountPublicKey)) {
    data.push({ key: 'New account key', value: requestData.newAccountPublicKey.toShortString() });
  }

  if (!requestData.newSpendingPublicKey1.equals(GrumpkinAddress.ZERO)) {
    data.push({ key: 'New spending key', value: requestData.newSpendingPublicKey1.toShortString() });
  }

  if (!requestData.newSpendingPublicKey2.equals(GrumpkinAddress.ZERO)) {
    data.push({ key: 'New spending key', value: requestData.newSpendingPublicKey2.toShortString() });
  }

  const feeStr = assetValueToString(requestData.fee, sdk);

  return data.concat([
    { key: 'Transaction Fee', value: feeStr },
    { key: 'Total Cost', value: feeStr, highlight: true },
  ]);
}

function renderDefiProofSummary(requestData: DefiProofRequestData, sdk: AztecSdk) {
  const {
    assetValue: { value },
    bridgeCallData,
  } = requestData;

  const inputAssetValues: AssetValue[] = [{ assetId: bridgeCallData.inputAssetIdA, value }];
  if (bridgeCallData.secondInputInUse) {
    inputAssetValues.push({ assetId: bridgeCallData.inputAssetIdB, value });
  }

  const outputAssetIds: number[] = [bridgeCallData.outputAssetIdA];
  if (bridgeCallData.secondOutputInUse) {
    outputAssetIds.push(bridgeCallData.outputAssetIdB);
  }

  return [
    { key: 'Send to', value: 'Defi integration' },
    ...inputAssetValues.map((assetValue, index) => ({
      key: `Amount ${inputAssetValues.length > 1 ? String.fromCharCode(65 + index) : ''}`,
      value: assetValueToString(assetValue, sdk),
    })),
    ...outputAssetIds.map((assetId, index) => ({
      key: `Receive ${outputAssetIds.length > 1 ? String.fromCharCode(65 + index) : ''}`,
      value: assetIdToSymbol(assetId, sdk),
    })),
    { key: 'Transaction Fee', value: assetValueToString(requestData.fee, sdk) },
    generateTotalCost([...inputAssetValues, requestData.fee], sdk),
  ];
}

export function TransactionSummary({ requestData, sdk }: { requestData: ProofRequestData; sdk: AztecSdk }) {
  let data: KeyValuePair[];
  switch (requestData.type) {
    case ProofRequestDataType.PaymentProofRequestData:
      data = renderPaymentProofSummary(requestData, sdk);
      break;
    case ProofRequestDataType.AccountProofRequestData:
      data = renderAccountProofSummary(requestData, sdk);
      break;
    case ProofRequestDataType.DefiProofRequestData:
      data = renderDefiProofSummary(requestData, sdk);
      break;
  }

  return <SummaryTable data={data} />;
}
