// @ts-ignore
import { Field, Layer, FeeSelector } from "aztec-ui";
import { Step } from "../step";

const assetOptions = [
  { value: 0, label: "ETH" },
  { value: 1, label: "DAI" },
  { value: 2, label: "USDC" },
  { value: 2, label: "USDT" },
];

const feeOptions = [
  {
    id: 0,
    content: {
      label: "Slow",
      timeStr: "10 hours",
      feeAmountStr: "0.00031 ETH",
      feeBulkPriceStr: "$10.40",
    },
  },
  {
    id: 1,
    content: {
      label: "Instant",
      timeStr: "7 minutes",
      feeAmountStr: "0.0061 ETH",
      feeBulkPriceStr: "$205.36",
    },
  },
];
export function Deposit() {
  return (
    <Step
      header={"Make your First Deposit"}
      subtitle={"Lorem ipsum dolor sit amet"}
      fields={
        <>
          <Field
            label={"Deposit Amount (optional)"}
            value={""}
            balance={"0.0125"}
            layer={Layer.L1}
            selectedAsset={{ symbol: "ETH", id: 0 }}
            onClickMax={() => console.log("Clicked balance indicator")}
            allowAssetSelection={true}
            assetOptions={assetOptions}
          />
          <FeeSelector
            value={0}
            label={"Gas Fee"}
            placeholder={"Placeholder"}
            options={feeOptions}
            onChangeValue={() => {}}
          />
        </>
      }
    />
  );
}
