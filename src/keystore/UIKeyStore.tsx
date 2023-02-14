import {
  BarretenbergWasm,
  Schnorr,
  GrumpkinAddress,
  ConstantKeyPair,
  KeyStore,
  KeyPair,
  Permission,
  ProofInput,
  SchnorrSignature,
  shouldBeSignedWithAccountKey,
  Grumpkin,
} from '@aztec/sdk';

export type PrivKeyResolver = (value: Buffer) => void;
// type AppStateSetter = React.Dispatch<React.SetStateAction<AppState>>;
type PrivKeyResolverSetter = (resolve: PrivKeyResolver) => void;

// key for localStorage
const ACCOUNT_KEY_KEY = 'account-key';

export class UIKeyStore implements KeyStore {
  private accountKey: KeyPair | undefined;
  private spendingPublicKey: GrumpkinAddress | undefined;
  // Does nothing until connectUI is called
  private startGenerateSpendingKey: PrivKeyResolverSetter = () => undefined;
  private startGenerateAccountKey: PrivKeyResolverSetter = () => undefined;

  constructor(private wasm: BarretenbergWasm, private permissions: Permission[]) {}

  connectUI(startGenerateSpendingKey: PrivKeyResolverSetter, startGenerateAccountKey: PrivKeyResolverSetter) {
    this.startGenerateSpendingKey = startGenerateSpendingKey;
    this.startGenerateAccountKey = startGenerateAccountKey;
  }

  private privKeyToKeyPair(privKey: Buffer) {
    const grumpkin = new Grumpkin(this.wasm);
    const schnorr = new Schnorr(this.wasm);
    const pubKey = GrumpkinAddress.fromPrivateKey(privKey, grumpkin);
    return new ConstantKeyPair(pubKey, privKey, schnorr);
  }

  private generateAccountKey() {
    // Fetch from localStorage
    const privKeyStr = localStorage.getItem(ACCOUNT_KEY_KEY);
    if (privKeyStr) {
      const privKey = Buffer.from(privKeyStr, 'hex');
      return this.privKeyToKeyPair(privKey);
    }

    return new Promise<KeyPair>(resolve =>
      this.startGenerateAccountKey((privKey: Buffer) => {
        const keyPair = this.privKeyToKeyPair(privKey);
        localStorage.setItem(ACCOUNT_KEY_KEY, privKey.toString('hex'));
        resolve(keyPair);
      }),
    );
  }

  private generateSpendingKey() {
    return new Promise<KeyPair>(resolve =>
      this.startGenerateSpendingKey((privKey: Buffer) => {
        const keyPair = this.privKeyToKeyPair(privKey);
        resolve(keyPair);
      }),
    );
  }

  public async connect() {
    return { accountKey: await this.getAccountKey(), permissions: this.permissions };
  }

  public async disconnect() {}

  public async getAccountKey(): Promise<KeyPair> {
    return this.accountKey || (await this.generateAccountKey());
  }

  public async getSpendingPublicKey() {
    return this.spendingPublicKey || (await this.generateSpendingKey()).getPublicKey();
  }

  public getPermissions() {
    return Promise.resolve(this.permissions);
  }

  public setPermissions(permissions: Permission[]) {
    this.permissions = permissions;
    return Promise.resolve();
  }

  public approveProofsRequest() {
    // TODO - check proof request permission
    return Promise.resolve({ approved: true, error: '' });
  }

  public approveProofInputsRequest() {
    // TODO - check proof request permission
    return Promise.resolve({ approved: true, error: '' });
  }

  public async signProofs(proofInputs: ProofInput[]): Promise<SchnorrSignature[]> {
    const accountKey = await this.getAccountKey();
    let spendingKey: GrumpkinAddress; // Cache spending key for multiple proofs

    return await Promise.all(
      proofInputs.map(async p => {
        let key: any = accountKey; // TODO fix type
        if (!shouldBeSignedWithAccountKey(p)) {
          spendingKey = spendingKey || (await this.generateSpendingKey());
          key = spendingKey;
        }
        return key.signMessage(p.signingData);
      }),
    );
  }
}
