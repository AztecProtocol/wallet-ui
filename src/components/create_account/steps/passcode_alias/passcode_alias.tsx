// @ts-ignore
import { Field, FieldStatus } from "aztec-ui";
import { useState } from "react";
import { Step } from "../step";

export function PasscodeAlias() {
  const [alias, setAlias] = useState("");
  const [passcode, setPasscode] = useState("");
  const [reconfirmpasscode, setReconfirmPasscode] = useState("");

  return (
    <Step
      header={"Choose Alias & Passcode"}
      subtitle={"Lorem ipsum dolor sit amet"}
      fields={
        <>
          <Field
            value={alias}
            label="Choose an alias"
            status={alias.length > 0 ? FieldStatus.Success : null}
            placeholder="Enter alias"
            onChangeValue={setAlias}
          />
          <Field
            value={passcode}
            password={true}
            label="Choose a passcode"
            status={passcode.length > 0 ? FieldStatus.Success : null}
            placeholder="Enter passcode"
            autoComplete={"new-password"}
            onChangeValue={setPasscode}
          />
          <Field
            value={reconfirmpasscode}
            password={true}
            label="Reconfirm your passcode"
            status={
              reconfirmpasscode.length > 0
                ? passcode === reconfirmpasscode
                  ? FieldStatus.Success
                  : FieldStatus.Error
                : null
            }
            placeholder="Re-enter passcode"
            autoComplete={"new-password"}
            onChangeValue={setReconfirmPasscode}
          />
        </>
      }
    />
  );
}
