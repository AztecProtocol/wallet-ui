import { AztecKeyStore, EthAddress, EthereumProvider } from '@aztec/sdk';
import { AztecSdk } from '@aztec/sdk/dest/aztec_sdk/aztec_sdk';

// Ideally we want to get this from bb.js
export interface AssetValue {
  assetId: number;
  value: bigint;
}

export default async function sendProof(
  sdk: AztecSdk,
  keyStore: AztecKeyStore,
  registerFee: AssetValue,
  ethDeposit: string,
  alias: string,
  depositorAddress: EthAddress,
  depositorSigner: EthereumProvider,
) {
  const deposit = sdk.toBaseUnits(0, ethDeposit);
  const aztecWalletProvider = await sdk.createAztecWalletProvider(keyStore);
  await aztecWalletProvider.connect();
  const accountPublicKey = await sdk.addAccount(aztecWalletProvider);
  const spendingKey = await aztecWalletProvider.getSpendingPublicKey();
  await sdk.awaitAccountSynchronised(accountPublicKey);

  const controller = sdk.createRegisterController(
    accountPublicKey,
    alias,
    spendingKey,
    undefined,
    deposit,
    registerFee,
    depositorAddress,
    aztecWalletProvider,
    depositorSigner,
  );

  const requiredFunds = await controller.getRequiredFunds();
  if (requiredFunds > 0n) {
    console.log(`depositing funds to contract...`);
    await controller.depositFundsToContract();
    console.log(`awaiting transaction confirmation...`);
    await controller.awaitDepositFundsToContract();
  }
  console.log(`generating proof...`);
  await controller.createProofs();
  console.log(`signing proof...`);
  await controller.sign();
  console.log(`sending proof...`);
  await controller.send();
  console.log(`done!`);
}
