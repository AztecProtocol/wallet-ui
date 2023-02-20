import { Button } from '@aztec/aztec-ui';
import { KeyStoreRequest } from '../../iframe/WalletConnectKeyStore';

export interface ApproveKeyStoreRequestProps {
  request: KeyStoreRequest;
  onUserResponse: (accepted: boolean) => void;
}

export function ApproveKeyStoreRequest(props: ApproveKeyStoreRequestProps) {
  return (
    <div>
      <h1>Approve {props.request.type}:</h1>
      <Button onClick={() => props.onUserResponse(true)} text="Approve" />
      <Button onClick={() => props.onUserResponse(false)} text="Reject" />
    </div>
  );
}
