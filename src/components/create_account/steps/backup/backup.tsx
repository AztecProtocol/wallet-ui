// @ts-ignore
import { ImageButton, ImageButtonIcon } from "aztec-ui";
import { useState } from "react";
import { Step } from "../step";
import styles from "./backup.module.scss";

export function Backup() {
  const [key, setKey] = useState<string>("");

  return (
    <Step
      header={"Back Up Your Credentials"}
      subtitle={"Lorem ipsum dolor sit amet"}
      fields={
        <div className={styles.buttonsWrapper}>
          <ImageButton
            icon={ImageButtonIcon.Download}
            label="Download your key"
          />
        </div>
      }
    />
  );
}
