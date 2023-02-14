export default function getChainId() {
  return +(process.env.VITE_CHAIN_ID || "1337");
}
