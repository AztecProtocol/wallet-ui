import {
  SchnorrSignature,
  ProofInput,
  KeyStore,
  KeyPair,
  Permission,
  AztecKeyStore,
  ProofRequestData,
} from '@aztec/sdk-incubator';

export interface ProofsRequest {
  type: 'proofs';
  data: ProofRequestData;
}

export interface ProofsInputsRequest {
  type: 'proofInputs';
  data: ProofRequestData;
}

export type TransactionRequest = ProofsRequest | ProofsInputsRequest;
export type TransactionRequestResponse = { approved: boolean; error: string };

export class WalletConnectKeyStore implements KeyStore {
  constructor(
    private aztecKeyStore: AztecKeyStore | undefined,
    // UI connecting function
    // Show approval dialogue
    private approveRequest: (request: TransactionRequest) => Promise<TransactionRequestResponse>,
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

  public async approveProofsRequest(proofRequestData: ProofRequestData) {
    if (!this.aztecKeyStore) {
      return {
        approved: false,
        error: 'Wallet not connected',
      };
    }
    return await this.approveRequest({
      type: 'proofs',
      data: proofRequestData,
    });
  }

  public async approveProofInputsRequest(proofRequestData: ProofRequestData) {
    if (!this.aztecKeyStore) {
      return {
        approved: false,
        error: 'Wallet not connected',
      };
    }
    return await this.approveRequest({
      type: 'proofInputs',
      data: proofRequestData,
    });
  }

  public signProofs(proofInputs: ProofInput[]): Promise<SchnorrSignature[]> {
    this.ensureHaveKeyStore();
    return this.aztecKeyStore!.signProofs(proofInputs);
  }
}
