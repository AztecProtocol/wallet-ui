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
} from '@aztec/sdk';
import { AssetValue } from '../../utils/assets';
import style from './transaction_summary.module.scss';

interface KeyValuePair {
  key: string;
  value: string;
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
            <td>{pair.key}</td>
            <td>{pair.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function generateAmountAndFeeSummary(amount: AssetValue, fee: AssetValue, sdk: AztecSdk) {
  const amountStr = sdk.fromBaseUnits(amount, true);
  const feeStr = sdk.fromBaseUnits(fee, true);
  const isSameAsset = amount.assetId === fee.assetId;
  let totalStr: string;
  if (isSameAsset) {
    totalStr = sdk.fromBaseUnits({ assetId: amount.assetId, value: amount.value + fee.value }, true);
  } else {
    totalStr = `${amountStr} + ${feeStr}`;
  }

  return [
    { key: 'Amount', value: amountStr },
    { key: 'Transaction Fee', value: feeStr },
    { key: 'Total Cost', value: totalStr },
  ];
}

function renderPaymentProofSummary(requestData: PaymentProofRequestData, sdk: AztecSdk) {
  let recipientRow: KeyValuePair;

  if (requestData.proofId === ProofId.WITHDRAW) {
    recipientRow = { key: 'L1 Recipient', value: shortEthAddress(requestData.publicOwner) };
  } else {
    recipientRow = { key: 'Recipient', value: requestData.recipient.toShortString() };
  }

  return [recipientRow, ...generateAmountAndFeeSummary(requestData.assetValue, requestData.fee, sdk)];
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

  const feeStr = sdk.fromBaseUnits(requestData.fee, true);

  return data.concat([
    { key: 'Transaction Fee', value: feeStr },
    { key: 'Total Cost', value: feeStr },
  ]);
}

function renderDefiProofSummary(requestData: DefiProofRequestData, sdk: AztecSdk) {
  return [
    { key: 'Recipient', value: 'Defi integration' },
    ...generateAmountAndFeeSummary(requestData.assetValue, requestData.fee, sdk),
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
