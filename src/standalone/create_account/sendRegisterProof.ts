import { AztecKeyStore, AztecSdk, EthAddress, EthereumProvider } from '@aztec/sdk-incubator';

// Ideally we want to get this from bb.js
export interface AssetValue {
  assetId: number;
  value: bigint;
}

export interface EthIdentity {
  ethAddress: EthAddress;
  ethSigner: EthereumProvider;
}

interface SendRegisterProofArgs {
  sdk: AztecSdk;
  keyStore: AztecKeyStore;
  registerFee: AssetValue;
  ethDeposit: string;
  alias: string;
  depositor: EthIdentity;
  updateLog: (msg: string) => void;
}

export default async function sendRegisterProof({
  sdk,
  keyStore,
  registerFee,
  ethDeposit,
  alias,
  depositor,
  updateLog,
}: SendRegisterProofArgs) {
  const deposit = sdk.toBaseUnits(0, ethDeposit);
  const aztecWalletProvider = await sdk.createAztecWalletProvider(keyStore);
  await aztecWalletProvider.connect();
  const accountPublicKey = await sdk.addAccount(aztecWalletProvider);
  const spendingKey = await aztecWalletProvider.getSpendingPublicKey();

  const controller = sdk.createRegisterController(
    accountPublicKey,
    alias,
    spendingKey,
    undefined,
    deposit,
    registerFee,
    depositor.ethAddress,
    aztecWalletProvider,
    depositor.ethSigner,
  );

  const requiredFunds = await controller.getRequiredFunds();
  if (requiredFunds > 0n) {
    updateLog(`depositing funds to contract...`);
    await controller.depositFundsToContract();
    updateLog(`awaiting transaction confirmation...`);
    await controller.awaitDepositFundsToContract();
  }
  updateLog(`generating proof...`);
  await controller.createProofs();
  updateLog(`signing proof...`);
  await controller.sign();
  updateLog(`sending proof...`);
  await controller.send();
  updateLog(`done!`);
}
