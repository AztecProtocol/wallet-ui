# Key Generation

## Assumptions:

1. User has an Ethereum Private Key, but they may lose this.
2. User has a password but they may forget this.
3. User can ask the browser to store information using a password manager. This information may be synced across devices depending on the browser / user permissions/ password manager.
4. Users need a way to recover any information they ask the password manager to store.
5. User can store a recovery kit in a safe place.
6. Anything stored in the recovery kit should not require a second secret bit of information to use.

## Proposed schema

This schema relies on the WebCrypto API which is available in all browsers.

To start the user uses this API to generate two uniformly random keys with 192 bits of security.

These keys are truncated to the correct length for Grumpkin keys (32 bytes).

```typescript
Account Private Key = ECDSA.generate()
// Via SubtleCrypto.generate()
```

```typescript
Spending Private Key = ECDSA.generate()
// Via SubtleCrypto.generate()
```

An account is created adding in the Spending Private Key and registering an Alias.

## Storing the keys securely

In order to store the keys securely so they can be used by the wallet to decrypt data and sign transactions, we use the browsers password manager. This can either be the browsers built in password manager or a third party like 1Passsword.

Most password managers store passwords encrypted, however for additional security we further encrypt the password with a symetric encryption key derived from the users password and a random salt.

### Step 1. Derive an encryption key.

```typescript
Users Aztec Password = At least 12 Chars, numbers and symbols.

Symmetric Encryption Key = KDF(SEED: Users Aztec Password, SALT: Random Salt)
// Via SubtleCrypto.derive()
```

### Step 2. Prepare the plain text message to store in the users password manager

```typescript
Random Salt = randomString(128)

Cipher = encrypt(MESSAGE: concat(Account Private Key, Spending Private Key) KEY: Symmetric Encryption Key)
// Via SubtleCrypto.encrypt()

Password Manager Entry = concact(Cipher, Random Salt)
```

## Account recovery

To ensure the user can still access their account under the above assumptions, a recovery kit is required. This kit contains infromation needed to recover the Account Private Key and regain spending access on the account.

## Recovering the Spending Private Key

Using the Account Abstraction built into Aztec Connect the user can add an additional spending key to their account, giving them back spending access if they can construct a valid Account Proof.

The account proof requires a signature from an existing Spending Private Key on the account to be valid.

The signature is generated at account creation time and stored in the users recovery kit. The signature will only add in the specified Spending Key to the account. The account added is derived from the user ethereum address.

In order to generate the recovery key, the user is asked to sign a message with their Ethereum Private Key. They will only do this on account creation or when recovering their account. This message is used to derive their Recovery Private Key.

```typescript
Recovery Private Key = ECDSA.sign(MESSAGE:'Sign this message to generate your account Recovery Key. IMPORTANT! Only sign this message if you trust the dAPP', KEY: Ethereum Private Key)

Recovery Public Key = g * Recovery Private Key

Recovery Signature = Schnorr.sign(MESSAGE: Recovery Public Key, KEY:Spending Private Key)

Social Recovery Signature = Schnorr.sign(MESSAGE: Trusted Friend Public Key , KEY:Spending Private Key)
```

## Recovering the Account Private Key

To recover the account key, we need to create a cipher stored in the recovery kit.

```typescript
Recovery Salt = randomString(128)

Recovery Encryption Key = KDF(SEED: Recovery Private Key, SALT: Recovery Salt)
// Via SubtleCrypto.derive()

Recovery Cipher = encrypt(MESSAGE: Account Private Key, KEY: Recovery Encryption Key)
// Via SubtleCrypto.encrypt()
```

## Recovery Kit

This is a downloadable PDF that should be stored in a safe place. It contains:

```
Important this information can be used to recover you Aztec Account.

## It should only be used on https://wallet.aztec.network/recovery

**Recovery Salt**

0xasdasdfasasdfasdfasdfasd

**Recovery Cipher**

0xasdasdfasasdfasdfasdfasd

**Recovery Signature**

0xasdasdfasasdfasdfasdfasd
```

## Scenarios

### Lost device / no access to password manager / can’t remeber user password.

Here the user must posses their recovery kit and have access to their Ethereum Private Key. If they posses this, they can do the following.

1. Derive their `Recovery Private Key` using their `Ethereum Private Key`.
2. Derive the `Recovery Encryption key` using the `Recovery Private Key` and the `Recovery Salt` contained in their recovery kit.
3. Decrypt the `Recovery Cipher` contained in their Recovery Kit, giving them their `Account Private Key`.
4. Use the `Recovery Signature` contained in the recovery kit to permission in their `Recovery Private Key` into their Aztec Account to spend funds, using the Account Proof.

### Attacker gets access to Recovery Kit.

Here the user is still safe as the attacker would need their `Recovery Private Key` to use anything in the Recovery Kit. The user would be recommended to migrate their account to a new `Account Private Key` and `Spending Private Key` and re create their Recovery Kit.

### Attacker gets access to the Ciphertext stored in password manager

As this is stored encrypted, the hacker would need the users Aztec Password to derive the `Symmetric Encryption Key`. This password could be suspect to brute force attacks.

It may be worth considering encrypting the Spending `Private Key` and `Account Private Key` with different keys to make it harder for an attacker with access to the users password manager to spend funds. This would be at the cost of UX though.

### Attacker tricks the user into generating their Recovery Private Key.

Without the `Recovery Kit`, the attacker can’t use this in any attack. However there is a phising attack here that the attacker could trick the user into “recovering” on an insecure website.

To combat this, the recovery kit should explictly detail the correct URL to recover via e.g `wallet.aztec.network/recovery`.

### User loses access to their Ethereum Private Key.

If the user does not have access to their Ethereum Private Key, their recovery kit is usless. The UI can encourage them to periodical prove they have access to this key to mitigate against this. Should they fail that test, a new recovery kit can be generated.

So long as an attacker does not have access to the `Old Ethereum Private Key` this should be secure. If their is a chance an attacker has access to the `Old Ethereum Private Key` and the old recovery kit can’t be guranteed to be destroyed, security concious users should migrate to a new account.
