import { keyPairFromPK, BarretenbergWasm, AztecBuffer } from '@aztec/sdk';
import { useSignMessage } from 'wagmi';

export async function generateRecoveryKey(signMessage: ReturnType<typeof useSignMessage>, wasm: BarretenbergWasm) {
  const signature = await signMessage.signMessageAsync();
  // TODO check why 32 hex chars instead of 32 bytes
  const slicedSignature = signature.slice(2, 34);
  return keyPairFromPK(AztecBuffer.from(slicedSignature), wasm);
}
