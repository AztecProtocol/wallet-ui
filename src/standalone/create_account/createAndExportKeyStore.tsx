import { AztecKeyStore, BarretenbergWasm } from '@aztec/alpha-sdk';

export default async function createAndExportKeyStore(passcode: string, wasm: BarretenbergWasm) {
  const keyStore = await AztecKeyStore.create(wasm);
  const encryptedKeyStore = await keyStore.export(passcode);
  return { keyStore, encryptedKeyStore: encryptedKeyStore.toString('hex') };
}
