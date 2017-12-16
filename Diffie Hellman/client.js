// Bob

const crypto = require('crypto');
const utils = require('./utils.js');

new Promise((resolve, reject) => {
	const net = require('net');
	const client = new net.Socket();
	const privateKey = utils.randomBetween(10, 20, true);

	const dataHandler = data => {
		const receivedInfo = utils.handleResponse(data);
		client.write('PUBLICKEY:' + utils.generateKey(receivedInfo.BASENUMBER, privateKey, receivedInfo.PRIMENUMBER));
		client.removeListener('data', dataHandler);
		resolve([utils.generateKey(receivedInfo.PUBLICKEY, privateKey, receivedInfo.PRIMENUMBER), client, receivedInfo]);
	}

	client.on('data', dataHandler);
	client.connect(1337, '127.0.0.1', err => {
		if (err)
			console.log('Error with connecting to the server', err);
		else
			console.log('Setting up protocol');
	});
}).then(resp => {
	console.log('Listening for messages');

	const socket = resp[1];
	const receivedInfo = resp[2];
	const commonSecretKey = resp[0];

	function sendData(data) {
		socket.write(utils.encrypt(crypto, data, receivedInfo.HASHALGORITHM, commonSecretKey.toString()));
	}

	console.log('Type to send encryped message');
	utils.cmdInputReader(data => {
		sendData(new Buffer(data, 'utf-8'));
	});
});