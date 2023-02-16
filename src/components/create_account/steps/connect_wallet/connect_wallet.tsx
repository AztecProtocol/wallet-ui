// @ts-ignore
import { FieldStatus, Field } from "aztec-ui";
import { useContext, useState } from "react";
import { ToastsContext } from "../../../app";
import { Step } from "../step";

export function ConnectWallet() {
  const setToasts = useContext(ToastsContext);
  const [key, setKey] = useState<string>("");
  const [reconfirmKey, setReconfirmKey] = useState<string>("");

  const showToast = () => {
    setToasts((prevToasts: any) => [
      ...prevToasts,
      {
        text: "Encryption key copied to clipboard.",
        key: Date.now(),
        autocloseInMs: 5e3,
        closable: true,
      },
    ]);
  };

  return (
    <Step
      header={"Generate an Encryption Key"}
      subtitle={"Lorem ipsum dolor sit amet"}
      fields={
        <>
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            value="encryption_key"
            readOnly
            style={{ position: "fixed", top: "-50px", left: 0 }}
          />
          <Field
            label={"Encryption key"}
            sublabel={
              key
                ? "You can click on your encryption key to copy it to your clipboard."
                : null
            }
            placeholder="Click here to generate your encryption key"
            onClick={() => {
              const k = "this-is-a-test-key";
              setKey(k);
              navigator.clipboard.writeText(k);
              showToast();
            }}
            disabled={true}
            value={key}
            password={true}
            status={key.length > 0 ? FieldStatus.Success : null}
            autoComplete="new-password"
          />
          <Field
            label={"Confirm encryption key"}
            placeholder="Paste your encryption key here"
            onChangeValue={(value: string) => setReconfirmKey(value)}
            status={
              reconfirmKey.length > 0
                ? key === reconfirmKey
                  ? FieldStatus.Success
                  : FieldStatus.Error
                : null
            }
            value={reconfirmKey}
            password={true}
            autoComplete="new-password"
          />
        </>
      }
    />
  );
}
