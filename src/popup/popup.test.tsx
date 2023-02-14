import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import {
  JsonRpcProvider,
  WalletProvider,
  EthereumRpc,
  randomBytes,
  EthAsset,
  decryptPrivateKeys,
  BarretenbergWasm,
} from '@aztec/sdk';
import { AppWithMemoryRouter, ORIGIN, viewPaths } from './app.js';
import { readFileSync } from 'fs';

const {
  ETHEREUM_HOST = 'http://localhost:8545',
  ROLLUP_HOST = 'http://localhost:8081',
  PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
} = process.env;

const INITIAL_BALANCE = 10n ** 18n;

export async function createFundedWalletProvider(): Promise<WalletProvider> {
  const ethereumProvider = new JsonRpcProvider(ETHEREUM_HOST);
  const walletProvider = new WalletProvider(ethereumProvider);
  const ethereumRpc = new EthereumRpc(ethereumProvider);
  const jsonRpcAccount = (await ethereumRpc.getAccounts())[0];
  const ethAsset = new EthAsset(walletProvider);

  walletProvider.addAccount(randomBytes(32));
  await ethAsset.transfer(INITIAL_BALANCE, jsonRpcAccount, walletProvider.getAccount(0), { gasLimit: 1000000 });

  return walletProvider;
}

// test('try to generate account without user password', async () => {
//   const walletProvider = await createFundedWalletProvider();
//   const address = walletProvider.getAccounts()[0];
//   const balance = await new EthereumRpc(walletProvider).getBalance(address);

//   expect(balance).toBe(INITIAL_BALANCE);

//   const result = render(
//     <AppWithMemoryRouter
//       ethereumProvider={walletProvider}
//       address={address}
//       initialEntries={[viewPaths.CREATE_ACCOUNT_KEY]}
//     />,
//   );

//   fireEvent(window, new MessageEvent('message', { data: { foo: 'bar' }, origin: 'whatever.com' }));
//   const select = (id: string) => result.container.querySelector(id)!;

//   await click(select('#create-button'), /* wait a second */ 1000);
//   expect(select('#encrypted-keys').getAttribute('value')?.length).toBe(312);
//   await click(select('#connect-button')!);
// });

test('try to generate account with no user password', async () => {
  const walletProvider = await createFundedWalletProvider();
  const address = walletProvider.getAccounts()[0];
  const balance = await new EthereumRpc(walletProvider).getBalance(address);

  expect(balance).toBe(INITIAL_BALANCE);

  const result = render(
    <AppWithMemoryRouter
      ethereumProvider={walletProvider}
      address={address}
      initialEntries={[viewPaths.CREATE_ACCOUNT_KEY]}
    />,
  );
  const select = (id: string) => result.container.querySelector(id)!;

  const userPassword = () => select('#user-pass').getAttribute('value')!;
  await click(select('#create-account-button'), /* wait until */ () => expect(userPassword()).toBeTruthy());
  const encryptedKeys = select('#encrypted-keys').getAttribute('value')!;
  expect(userPassword).toBe('');
  expect(encryptedKeys?.length).toBe(312);

  const keys = await decryptPrivateKeys(Buffer.from(encryptedKeys, 'hex'), userPassword());

  await click(
    select('#connect-button'),
    /* wait until */ () => expect(window.opener.postMessage).toHaveBeenCalledTimes(1),
  );
  expect(window.opener.postMessage).toHaveBeenCalledWith(
    { fn: 'resolvePrivateKeys', args: [keys.accountKey, keys.spendingKey] },
    ORIGIN,
  );
});

async function click(button: Element, waitForCondition: () => void) {
  await act(async () => {
    // NOTE: must cast to any due to module: "node16" incompatibility
    await (userEvent as any).click(button);
    if (waitForCondition) {
      await waitFor(waitForCondition);
    }
  });
}
// test('create account', async () => {
//   const ethereumProvider = new JsonRpcProvider(ETHEREUM_HOST);
//   // const walletProvider = new WalletProvider(ethereumProvider);
//   const ethereumRpc = new EthereumRpc(ethereumProvider);
//   const account = (await ethereumRpc.getAccounts())[0];
//   const balance = await ethereumRpc.getBalance(account);

//   render(<AppWithMemoryRouter initialEntries={[viewPaths.CREATE_ACCOUNT_KEY]} />);

//   console.log({ balance });
//   // // account
//   // // ARRANGE
//   // render(<div />);
//   // // ACT
//   // click(screen.getByText('Load Greeting'));
//   // await screen.findByRole('heading');
//   // // ASSERT
//   // expect(screen.getByRole('heading')).toHaveTextContent('hello there');
//   // expect(screen.getByRole('button')).toBeDisabled();
// });
