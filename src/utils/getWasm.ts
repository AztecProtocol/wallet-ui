import { BarretenbergWasm } from "@aztec/sdk";

// Awaited by anything that needs wasm
let WASM_PROMISE: Promise<BarretenbergWasm>;

export default async function getWasm() {
  WASM_PROMISE = WASM_PROMISE || BarretenbergWasm.new();
  return await WASM_PROMISE;
}
