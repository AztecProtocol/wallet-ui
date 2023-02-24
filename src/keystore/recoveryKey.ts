import { keyPairFromPK, BarretenbergWasm, AztecBuffer } from '@aztec/sdk-incubator';
import { useSignMessage } from 'wagmi';

export async function generateRecoveryKey(signature: `0x${string}`, wasm: BarretenbergWasm) {
  // TODO check why 32 hex chars instead of 32 bytes
  const slicedSignature = signature.slice(2, 34);
  return keyPairFromPK(AztecBuffer.from(slicedSignature), wasm);
}
