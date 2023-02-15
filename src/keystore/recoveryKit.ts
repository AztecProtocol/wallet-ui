import { AztecKeyStore, RecoveryKit, ConstantKeyPair } from '@aztec/sdk';
import { jsPDF } from 'jspdf';

function chunkString(str: string, length: number) {
  const numChunks = Math.ceil(str.length / length);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += length) {
    chunks[i] = str.substr(o, length);
  }

  return chunks;
}

const FONT_SIZE = 12;
const CHARS_PER_LINE = 74;

function generateRecoveryKitText(recoveryKit: RecoveryKit) {
  return `
Important: this information can be used to recover you Aztec Account.

It should only be used on https://wallet.aztec.network/recovery
-----------

**Recovery Salt**

0x${recoveryKit.salt.toString('hex')}

**Recovery Cipher**

0x${recoveryKit.cipher.toString('hex')}

**Recovery Signature**

0x${recoveryKit.signature.toString('hex')}`;
}

export async function downloadRecoveryKit(keyStore: AztecKeyStore, recoveryKey: ConstantKeyPair, userAlias: string) {
  const recoveryKit = await keyStore.generateRecoveryKit(recoveryKey, userAlias);

  const recoveryKitText = generateRecoveryKitText(recoveryKit);

  const lines = recoveryKitText.split('\n').flatMap(line => {
    return line.length > CHARS_PER_LINE ? chunkString(line, CHARS_PER_LINE) : [line];
  });

  const document = new jsPDF();

  document.setFontSize(FONT_SIZE);
  document.setFont('Courier');

  document.text(lines, 10, 10);
  await document.save('recovery-kit.pdf', { returnPromise: true });
}
