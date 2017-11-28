const dec = new TextDecoder();
const enc = new TextEncoder("utf-8");
const textArray = enc.encode("This is a string converted to a Uint8Array");

(async function test() {
	let publicKey, privateKey, encryptedData, decryptedData;
	const algorithmIdentifier = {
		name: "RSA-OAEP",
		modulusLength: 2048, //can be 1024, 2048, or 4096
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
		hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
	};

	// Generate key
	await window.crypto.subtle.generateKey(algorithmIdentifier, true, ["encrypt", "decrypt"])
	.then(key => {
		console.log('Generated key');
		publicKey = key.publicKey;
		privateKey = key.privateKey;
	}).catch(console.error);

	// Encrypt data
	await window.crypto.subtle.encrypt(algorithmIdentifier, publicKey, textArray)
	.then(encrypted => {
		console.log('Encrypted data');
		encryptedData = new Uint8Array(encrypted);
	}).catch(console.error);

	// Decrypt data
	await window.crypto.subtle.decrypt(algorithmIdentifier, privateKey, encryptedData)
	.then(decrypted => {
		console.log('Decrypted data');
		decryptedData = new Uint8Array(decrypted);
	}).catch(console.error);

	console.log(dec.decode(decryptedData));
}());