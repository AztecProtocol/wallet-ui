import { SchnorrSignature, ProofInput, KeyStore, KeyPair, Permission, AztecKeyStore } from '@aztec/sdk';

export class WalletConnectKeyStore implements KeyStore {
  constructor(
    private aztecKeyStore: AztecKeyStore,
    // UI connecting functions
    // Show approval dialogues
    private showApproveProofsRequest: () => Promise<{ approved: boolean; error: string }>,
    private showApproveProofInputsRequest: () => Promise<{ approved: boolean; error: string }>,
  ) {}
  public connect() {
    return this.aztecKeyStore.connect();
  }

  public disconnect() {
    return this.aztecKeyStore.disconnect();
  }

  public getAccountKey(): Promise<KeyPair> {
    return this.aztecKeyStore.getAccountKey();
  }

  public async getSpendingPublicKey() {
    return this.aztecKeyStore.getSpendingPublicKey();
  }

  public getPermissions() {
    return this.aztecKeyStore.getPermissions();
  }

  public setPermissions(permissions: Permission[]) {
    return this.aztecKeyStore.setPermissions(permissions);
  }
  public async approveProofsRequest() {
    return await this.showApproveProofsRequest();
  }

  public async approveProofInputsRequest() {
    return await this.showApproveProofInputsRequest();
  }

  public signProofs(proofInputs: ProofInput[]): Promise<SchnorrSignature[]> {
    return this.aztecKeyStore.signProofs(proofInputs);
  }
}
