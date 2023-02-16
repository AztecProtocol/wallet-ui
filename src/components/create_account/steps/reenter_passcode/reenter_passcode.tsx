// @ts-ignore
import { Field } from "aztec-ui";
import { Step } from "../step";

export function ReenterPasscode() {
  return (
    <Step
      header={"Re-enter your account details"}
      subtitle={"Lorem ipsum dolor sit amet"}
      fields={
        <>
          <Field
            value={""}
            password={true}
            label="Re-enter your Encryption Key"
            placeholder="Enter encryption key"
            onChangeValue={() => {}}
          />
          <Field
            value={""}
            password={true}
            label="Re-enter your Passcode"
            placeholder="Enter passcode"
            onChangeValue={() => {}}
          />
        </>
      }
    />
  );
}
