import * as cbor from "cbor";
import { createVerify, createHash } from "crypto";
import { AuthData, parseAuthData } from "./parse_auth_data.js";
import { ec } from "elliptic";
import { Buffer } from 'buffer/';

function sha256(buf: Buffer) {
  return createHash("sha256").update(buf).digest();
}

/* tslint:disable:no-console */

async function makeCred(): Promise<AuthData> {
  const id = Uint8Array.from(
    window.atob("MIIBkzCCATigAwIBAjCCAZMwggE4oAMCAQIwggGTMII="),
    (c) => c.charCodeAt(0)
  );
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,

    rp: {
      name: "AZTEC",
    },

    user: {
      id,
      name: "TouchIdWallet",
      displayName: "User 1",
    },

    authenticatorSelection: { userVerification: "required" },

    attestation: "none",

    pubKeyCredParams: [
      {
        type: "public-key",
        alg: -7, // "ES256" IANA COSE Algorithms registry
      },
      {
        type: "public-key",
        alg: -257, // "RS256" IANA COSE Algorithms registry
      },
    ],
  };

  const newCredentialInfo = (await navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential;
  const attestationResponse =
    newCredentialInfo.response as AuthenticatorAttestationResponse;

  console.log(attestationResponse);
  // let attestationObjectBuffer = window.atob(attestationResponse.attestationObject);
  const ctapMakeCredResp = cbor.decodeAllSync(
    Buffer.from(attestationResponse.attestationObject)
  )[0];
  console.log(ctapMakeCredResp);

  return parseAuthData(ctapMakeCredResp.authData);
}

export function parseCredentialPubKey(creds: Creds) {
  const publicKeyPem = ASN1toPEM(creds.pubKey);
  console.log(publicKeyPem);
  const { x, y, pubkey } = parsePublicKey(publicKeyPem);
  console.log({ x, y, pubkey });
  return { x, y, pubkey }

}

export async function sign(creds: Creds, msg: string) {

  const challenge = sha256(Buffer.from(msg));
  console.log("challenge hex", challenge.toString("hex"));


  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge,
    allowCredentials: [{ type: "public-key", id: creds.credId }],
    userVerification: "required",
  };
  console.log({ publicKey })
  const getAssertionResponse = (await navigator.credentials.get({
    publicKey,
  })) as PublicKeyCredential;
  console.log(getAssertionResponse)
  const signResponse = getAssertionResponse.response as AuthenticatorAssertionResponse;
  console.log({ signResponse });

  const clientDataJsonStr = new TextDecoder("utf-8").decode(
    signResponse.clientDataJSON
  );
  console.log(clientDataJsonStr);
  console.log("json hex", Buffer.from(clientDataJsonStr).toString("hex"));
  console.log("client json length: ", clientDataJsonStr.length);

  const clientDataJson = JSON.parse(clientDataJsonStr);
  console.log(clientDataJson);
  if (!challenge.equals(Buffer.from(clientDataJson.challenge, "base64"))) {
    throw new Error("Challenge unequal.");
  }
  if (clientDataJson.origin !== window.location.origin) {
    throw new Error("Origin unequal.");
  }
  if (clientDataJson.type !== "webauthn.get") {
    throw new Error("Type unequal.");
  }

  const authDataBuf = Buffer.from(signResponse.authenticatorData);
  const authData = parseAuthData(authDataBuf);
  console.log("auth data buf", authDataBuf.toString("hex"));
  console.log("auth data", authData);

  if (!authData.flags.up) {
    throw new Error("User was not presented during authentication!");
  }

  if (!authData.flags.uv) {
    throw new Error("User was not verified during authentication!");
  }

  const clientDataHash = sha256(Buffer.from(clientDataJsonStr));
  console.log("cdh", clientDataHash.toString("hex"));
  const signatureBase = Buffer.concat([authDataBuf, clientDataHash]);

  const hashedSigBase = sha256(signatureBase);
  console.log("hashed message: ", hashedSigBase.toString("hex"));
  // const verified = createVerify("sha256")
  //   .update(signatureBase)
  //   .verify(publicKey, Buffer.from(signResponse.signature));

  // const verified = verify(Buffer.from(signResponse.signature), hashedSigBase, publicKey, "ecdsa", "");
  const s = Buffer.from(signResponse.signature);
  const { x, y } = await parseCredentialPubKey(creds);
  console.log(s);
  console.log(s.toString("hex"));
  const signature = parseSignature(s);
  return {
    challenge: challenge,
    authData: authDataBuf,
    clientDataJson: Buffer.from(clientDataJsonStr),
    x,
    y,
    signature,
    hashedSigBase,
    signatureBase
  };

}

interface Creds {
  counter: number;
  credId: Buffer;
  pubKey: Buffer;
}

function COSEECDHAtoPKCS(COSEPublicKey: Buffer) {
  const coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
  const tag = Buffer.from([0x04]);
  const x = coseStruct.get(-2);
  const y = coseStruct.get(-3);

  return Buffer.concat([tag, x, y]);
}

export async function init() {
  let creds: Creds;

  const parsedAuthData = await makeCred();
  console.log(parsedAuthData);
  const pubKey = COSEECDHAtoPKCS(parsedAuthData.cosePublicKeyBuffer!);

  // Store counter, credId, and pub key.
  creds = {
    counter: parsedAuthData.counter,
    credId: parsedAuthData.credIdBuffer!,
    pubKey,
  };
  const toStore = {
    counter: parsedAuthData.counter,
    credId: parsedAuthData.credIdBuffer!.toString("base64"),
    pubKey: pubKey.toString("base64"),
  };
  window.localStorage.setItem("creds", JSON.stringify(toStore));
  return creds;
}






function parsePublicKey(publicKey: string) {
  // The base64 public key string without the '-----BEGIN PUBLIC KEY-----' and '-----END PUBLIC KEY-----' lines
  const base64PublicKey = publicKey
    .split("\n") // Split by newline
    .slice(1, -1) // Remove first and last items
    .join(""); // Join back into a single string

  // Decode base64
  const derBuffer = Buffer.from(base64PublicKey, "base64");

  // The key should start with a 0x04 byte indicating it's an uncompressed key,
  // followed by two 32-byte segments for the x and y coordinates.
  if (derBuffer[26] !== 0x04) {
    throw new Error("Not an uncompressed public key");
  }

  const x = derBuffer.slice(27, 27 + 32); // bytes 27-58
  const y = derBuffer.slice(59, 59 + 32); // bytes 59-90

  console.log("X:", x.toString("hex"));
  console.log("Y:", y.toString("hex"));
  return { x, y, pubkey: derBuffer.subarray(26, 91) };
}

function parseSignature(sigBuf: Buffer) {
  // Let's assume you have your 72-byte DER-encoded signature in a Buffer:
  const derSignatureBuffer = sigBuf;

  // Byte 4 tells us length of r. If its 33 we need to slice from byte 6.
  const rLength = derSignatureBuffer[3];
  const rOffset = rLength == 33 ? 5 : 4;
  const r = derSignatureBuffer.subarray(rOffset, rOffset + 32);

  const sLengthOffset = rOffset + 33; // Skip over r and and 0x02.
  const sLength = derSignatureBuffer[sLengthOffset];
  const sOffset = sLength == 33 ? sLengthOffset + 2 : sLengthOffset + 1;
  const s = derSignatureBuffer.subarray(sOffset, sOffset + 32);

  // // Check that the signature starts with a 0x30 byte indicating a DER SEQUENCE
  // if (derSignatureBuffer[0] !== 0x30) {
  //   throw new Error("Invalid signature format");
  // }

  // // The r component starts with a 0x02 byte, followed by a length byte
  // let offset = 2; // skip the sequence and length identifiers
  // if (derSignatureBuffer[offset] !== 0x02) {
  //   throw new Error("Invalid signature format");
  // }

  // const rLength = derSignatureBuffer[offset + 1];
  // if (rLength == 33) ++offset;
  // const r = derSignatureBuffer.slice(offset + 2, offset + 2 + 32);

  // // Skip past the r component to get to the s component
  // offset = offset + 2 + rLength;
  // if (derSignatureBuffer[offset] !== 0x02) {
  //   throw new Error("Invalid signature format");
  // }

  // const sLength = derSignatureBuffer[offset + 1];
  // if (sLength == 33) ++offset;
  // const s = derSignatureBuffer.slice(offset + 2, offset + 2 + sLength);

  console.log("r:", r.toString("hex"));
  console.log("s:", s.toString("hex"));

  return Buffer.concat([r, s]);
}

function ASN1toPEM(pkBuffer: Buffer) {
  let type;
  if (pkBuffer.length === 65 && pkBuffer[0] === 0x04) {
    pkBuffer = Buffer.concat([
      Buffer.from(
        "3059301306072a8648ce3d020106082a8648ce3d030107034200",
        "hex"
      ),
      pkBuffer,
    ]);

    type = "PUBLIC KEY";
  } else {
    type = "CERTIFICATE";
  }

  const b64cert = pkBuffer.toString("base64");

  let PEMKey = "";
  for (let i = 0; i < Math.ceil(b64cert.length / 64); i++) {
    const start = 64 * i;
    PEMKey += b64cert.substr(start, 64) + "\n";
  }

  PEMKey = `-----BEGIN ${type}-----\n` + PEMKey + `-----END ${type}-----\n`;
  return PEMKey;
}
