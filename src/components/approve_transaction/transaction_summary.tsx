import { AztecSdk, ProofId, ProofRequestData, ProofRequestDataType, EthAddress } from '@aztec/sdk';
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

export function TransactionSummary({ requestData, sdk }: { requestData: ProofRequestData; sdk: AztecSdk }) {
  let data: KeyValuePair[] = [];
  switch (requestData.type) {
    case ProofRequestDataType.PaymentProofRequestData:
      let recipientRow: KeyValuePair;

      if (requestData.proofId === ProofId.WITHDRAW) {
        recipientRow = { key: 'L1 Recipient', value: shortEthAddress(requestData.publicOwner) };
      } else {
        recipientRow = { key: 'Recipient', value: requestData.recipient.toShortString() };
      }

      data = [recipientRow, ...generateAmountAndFeeSummary(requestData.assetValue, requestData.fee, sdk)];
      break;
    case ProofRequestDataType.AccountProofRequestData:
      data = [
        { key: 'Operation', value: 'Account update' },
        { key: 'Transaction Fee', value: sdk.fromBaseUnits(requestData.fee, true) },
      ];
      break;
    case ProofRequestDataType.DefiProofRequestData:
      data = [
        { key: 'Recipient', value: 'Defi integration' },
        ...generateAmountAndFeeSummary(requestData.assetValue, requestData.fee, sdk),
      ];
      break;
  }

  return <SummaryTable data={data} />;
}
