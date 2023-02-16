// @ts-ignore
import { Loader } from "aztec-ui";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import style from "./creating_account.module.scss";

export function CreatingAccount() {
  const [isCreating, setIsCreating] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setIsCreating(false);
      setTimeout(() => {
        navigate("/connect");
      }, 3e3);
    }, 3e3);
  }, [navigate]);

  return (
    <div className={style.loader}>
      {isCreating ? (
        <>
          <div>Creating your wallet...</div>
          <Loader />
        </>
      ) : (
        <div>Welcome to Aztec!</div>
      )}
    </div>
  );
}
