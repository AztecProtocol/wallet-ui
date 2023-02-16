import { Route, Routes } from "react-router";
import { ToastGroup, ToastGroupPosition } from "aztec-ui";
import { createContext, useState } from "react";
import { SignIn } from "./sign_in";
import { CreateAccount } from "./create_account";
import { Connect } from "./connect";
import style from "./app.module.scss";

export const ToastsContext = createContext<any>([]);

export function App() {
  const [toasts, setToasts] = useState([]);

  function closeToast(key: string) {
    setToasts((prevToasts) =>
      prevToasts.filter((toast: any) => toast.key !== key)
    );
  }

  return (
    <div className={style.app}>
      <ToastsContext.Provider value={setToasts}>
        <Routes>
          <Route path={"/"} element={<SignIn />} />
          <Route path={"/create"} element={<CreateAccount />} />
          <Route path={"/connect"} element={<Connect />} />
        </Routes>
        <ToastGroup
          toasts={toasts}
          position={ToastGroupPosition.BottomCenter}
          onCloseToast={closeToast}
        />
      </ToastsContext.Provider>
    </div>
  );
}
