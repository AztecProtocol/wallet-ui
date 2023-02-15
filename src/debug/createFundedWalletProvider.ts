import {
  EthAsset,
  EthereumRpc,
  randomBytes,
  JsonRpcProvider,
  WalletProvider,
} from "@aztec/sdk";

const {
  ETHEREUM_HOST = "http://localhost:8545",
  ROLLUP_HOST = "http://localhost:8081",
  PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
} = process.env;

const INITIAL_BALANCE = 10n ** 18n;

export async function createFundedWalletProvider(): Promise<WalletProvider> {
  const ethereumProvider = new JsonRpcProvider(ETHEREUM_HOST);
  const walletProvider = new WalletProvider(ethereumProvider);
  const ethereumRpc = new EthereumRpc(ethereumProvider);
  const jsonRpcAccount = (await ethereumRpc.getAccounts())[0];
  const ethAsset = new EthAsset(walletProvider);

  walletProvider.addAccount(randomBytes(32));
  await ethAsset.transfer(
    INITIAL_BALANCE,
    jsonRpcAccount,
    walletProvider.getAccount(0),
    { gasLimit: 1000000 }
  );

  return walletProvider;
}
