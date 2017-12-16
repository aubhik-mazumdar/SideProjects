// Alice

const crypto = require('crypto');
const utils = require('./utils.js');

const hashAlgorithm = 'aes-256-ctr';

new Promise((resolve, reject) => {
	const net = require('net');

	/*const baseNumber = utils.randomBetween(1, 3, true);
	const privateKey = utils.randomBetween(10, 20, true);
	const primeNumber = utils.getPrime(utils.randomBetween(10, 20, true));*/

	const baseNumber = utils.randomBetween(1, 8, true); // Small
	const privateKey = utils.randomBetween(10, 20, true); // Between 1 and PrimeNumber
	const primeNumber = utils.randomBytes(crypto, 8); // Huge

	net.createServer(socket => {
		const dataHandler = data => {
			const receivedInfo = utils.handleResponse(data);
			socket.removeListener('data', dataHandler);
			resolve([utils.generateKey(receivedInfo.PUBLICKEY, privateKey, primeNumber), socket, receivedInfo]);
		}

		socket.on('data', dataHandler);
		socket.write('HASHALGORITHM:' + hashAlgorithm + ';BASENUMBER:' + baseNumber.toString() + ';PRIMENUMBER:' + primeNumber.toString() + ';PUBLICKEY:' + utils.generateKey(baseNumber, privateKey, primeNumber));
	}).listen(1337, err => {
		if (err)
			console.log('Error with starting server', err);
		else
			console.log('Setting up protocol');
	});
}).then(resp => {
	console.log('Sending messages');

	const socket = resp[1];
	const receivedInfo = resp[2];
	const commonSecretKey = resp[0];

	function decryptData(data) {
		return utils.decrypt(crypto, data, hashAlgorithm, commonSecretKey.toString()).toString('utf-8');
	}

	socket.on('data', data => {
		console.log('Got data:', decryptData(data));
	});
});