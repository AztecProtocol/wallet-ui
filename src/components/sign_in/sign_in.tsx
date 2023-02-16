import {
  Card,
  CardTheme,
  CardHeaderSize,
  Button,
  ButtonTheme,
  Field,
  Hyperlink,
  FieldStatus,
  // @ts-ignore
} from "aztec-ui";
import logo from "../assets/zkmoney-logo.png";
import { useState } from "react";
import { useNavigate } from "react-router";
import style from "./sign_in.module.scss";

export function SignIn() {
  const [passcode, setPasscode] = useState("");
  const navigate = useNavigate();

  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.NONE}
      cardHeader="Sign in to Aztec Wallet"
      cardTheme={CardTheme.LIGHT}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.header}>
            <img className={style.logo} src={logo} alt="Logo" />
            <div>Sign in to continue to zk.money</div>
          </div>
          <div className={style.fields}>
            <Field
              value={passcode}
              password={true}
              autoComplete="current-password"
              status={passcode.length > 0 ? FieldStatus.Success : undefined}
              label="Unlock with Passcode"
              placeholder="Enter passcode"
              onChangeValue={setPasscode}
            />
            <div className={style.links}>
              <Hyperlink
                className={style.link}
                label="Log in with a different account"
                href="/create"
                target="_self"
              />
              {/* <Hyperlink
                className={style.link}
                label="Create Aztec Wallet account"
                href="/create"
                target="_self"
              /> */}
              <Hyperlink
                className={style.link}
                label="I've forgotten my passcode"
              />
            </div>
          </div>
          <div className={style.buttons}>
            <div />
            <Button
              theme={ButtonTheme.Primary}
              text="Next"
              disabled={passcode.length === 0}
              onClick={() => navigate("/connect")}
            />
          </div>
        </div>
      }
    />
  );
}
