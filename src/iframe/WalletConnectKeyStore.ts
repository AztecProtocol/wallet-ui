import { SchnorrSignature, ProofInput, KeyStore, KeyPair, Permission, AztecKeyStore } from '@ludamad-aztec/sdk';

export class WalletConnectKeyStore implements KeyStore {
  constructor(
    private aztecKeyStore: AztecKeyStore | undefined,
    // UI connecting functions
    // Show approval dialogues
    private showApproveProofsRequest: () => Promise<{ approved: boolean; error: string }>,
    private showApproveProofInputsRequest: () => Promise<{ approved: boolean; error: string }>,
  ) {}

  private ensureHaveKeyStore() {
    if (!this.aztecKeyStore) {
      throw new Error('Wallet not connected');
    }
  }

  public connect() {
    this.ensureHaveKeyStore();
    return this.aztecKeyStore!.connect();
  }

  public disconnect() {
    this.ensureHaveKeyStore();
    return this.aztecKeyStore!.disconnect();
  }

  public getAccountKey(): Promise<KeyPair> {
    this.ensureHaveKeyStore();
    return this.aztecKeyStore!.getAccountKey();
  }

  public async getSpendingPublicKey() {
    this.ensureHaveKeyStore();
    return this.aztecKeyStore!.getSpendingPublicKey();
  }

  public getPermissions() {
    this.ensureHaveKeyStore();
    return this.aztecKeyStore!.getPermissions();
  }

  public setPermissions(permissions: Permission[]) {
    this.ensureHaveKeyStore();
    return this.aztecKeyStore!.setPermissions(permissions);
  }
  public async approveProofsRequest() {
    if (!this.aztecKeyStore) {
      return {
        approved: false,
        error: 'Wallet not connected',
      };
    }
    return await this.showApproveProofsRequest();
  }

  public async approveProofInputsRequest() {
    if (!this.aztecKeyStore) {
      return {
        approved: false,
        error: 'Wallet not connected',
      };
    }
    return await this.showApproveProofInputsRequest();
  }

  public signProofs(proofInputs: ProofInput[]): Promise<SchnorrSignature[]> {
    this.ensureHaveKeyStore();
    return this.aztecKeyStore!.signProofs(proofInputs);
  }
}
