import { keyPairFromPK, BarretenbergWasm, AztecBuffer } from '@aztec/alpha-sdk';

export async function generateRecoveryKey(signature: `0x${string}`, wasm: BarretenbergWasm) {
  const bufferSignature = AztecBuffer.from(signature.slice(2), 'hex');
  return keyPairFromPK(bufferSignature.slice(0, 32), wasm);
}
