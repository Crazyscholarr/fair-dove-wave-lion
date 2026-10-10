import { i as pbkdf2, r as sha512 } from "./noble__hashes.mjs";
//#region node_modules/@scure/bip39/esm/index.js
/**
* Audited & minimal JS implementation of
* [BIP39 mnemonic phrases](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
* @module
* @example
```js
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
const mn = bip39.generateMnemonic(wordlist);
console.log(mn);
const ent = bip39.mnemonicToEntropy(mn, wordlist)
bip39.entropyToMnemonic(ent, wordlist);
bip39.validateMnemonic(mn, wordlist);
await bip39.mnemonicToSeed(mn, 'password');
bip39.mnemonicToSeedSync(mn, 'password');

// Wordlists
import { wordlist as czech } from '@scure/bip39/wordlists/czech';
import { wordlist as english } from '@scure/bip39/wordlists/english';
import { wordlist as french } from '@scure/bip39/wordlists/french';
import { wordlist as italian } from '@scure/bip39/wordlists/italian';
import { wordlist as japanese } from '@scure/bip39/wordlists/japanese';
import { wordlist as korean } from '@scure/bip39/wordlists/korean';
import { wordlist as portuguese } from '@scure/bip39/wordlists/portuguese';
import { wordlist as simplifiedChinese } from '@scure/bip39/wordlists/simplified-chinese';
import { wordlist as spanish } from '@scure/bip39/wordlists/spanish';
import { wordlist as traditionalChinese } from '@scure/bip39/wordlists/traditional-chinese';
```
*/
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
function nfkd(str) {
	if (typeof str !== "string") throw new TypeError("invalid mnemonic type: " + typeof str);
	return str.normalize("NFKD");
}
function normalize(str) {
	const norm = nfkd(str);
	const words = norm.split(" ");
	if (![
		12,
		15,
		18,
		21,
		24
	].includes(words.length)) throw new Error("Invalid mnemonic");
	return {
		nfkd: norm,
		words
	};
}
var psalt = (passphrase) => nfkd("mnemonic" + passphrase);
/**
* Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
* @param mnemonic 12-24 words
* @param passphrase string that will additionally protect the key
* @returns 64 bytes of key data
* @example
* const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
* mnemonicToSeedSync(mnem, 'password');
* // new Uint8Array([...64 bytes])
*/
function mnemonicToSeedSync(mnemonic, passphrase = "") {
	return pbkdf2(sha512, normalize(mnemonic).nfkd, psalt(passphrase), {
		c: 2048,
		dkLen: 64
	});
}
//#endregion
export { mnemonicToSeedSync as t };
