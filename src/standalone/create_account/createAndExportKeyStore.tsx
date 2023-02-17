import { AztecKeyStore, ConstantKeyPair, BarretenbergWasm } from '@aztec/sdk';

export default async function createAndExportKeyStore(
  recoveryKey: ConstantKeyPair,
  passcode: string,
  wasm: BarretenbergWasm,
) {
  const keyStore = await AztecKeyStore.create(wasm);
  const encryptedKeyStore = await keyStore.export(passcode, recoveryKey);
  return { keyStore, encryptedKeyStore: encryptedKeyStore.toString('hex') };
}
