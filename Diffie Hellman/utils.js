Math.randomBetween = function(min, max, floor) {
	const randVal = Math.random() * (max - min + 1) + min;

	if (floor)
		return Math.floor(randVal);
	else
		return randVal;
}

const randomBytes = function(crypto, length, toNumber) {
	if (!toNumber)
		return parseInt(crypto.randomBytes(length).toString('hex'), 16);
	else
		return crypto.randomBytes(length);

	// return parseInt(crypto.randomBytes(4000).toString('hex'), 16);
}



module.exports.getPrime = function(leng) {
	let outp = '';

	if (!leng)
		leng = Math.randomBetween(10, 15, true);

	for (let i = 0; i < leng; i++)
		outp += Math.randomBetween(0, 9, true);

	return Number(outp);

	// return Math.floor(Math.pow(Math.random() * 10, 10 + Math.random() * 20));
}

module.exports.generateKey = function(baseNumber, privateKey, primeNumber) {
	return Math.pow(baseNumber, privateKey) % primeNumber;
}

module.exports.handleResponse = function(data) {
	const outpObj = {};
	const dataString = data.toString('utf-8');
	const messages = dataString.split(';');

	messages.forEach((object, key) => {
		const splitArr = object.split(':');
		const type = splitArr[0];
		const contents = splitArr[1];

		if (type && contents) {
			if (type.length > 0 && contents.length > 0) {
				const contentNumber = Number(contents);

				if (contentNumber)
					outpObj[type] = contentNumber;
				else
					outpObj[type] = contents;
			}
		}
	});

	return outpObj;
}

module.exports.encrypt = function(crypto, buffer, algorithm, password) {
	const cipher = crypto.createCipher(algorithm, password);
	const crypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

	return crypted;
}

module.exports.decrypt = function(crypto, buffer, algorithm, password) {
	const decipher = crypto.createDecipher(algorithm, password);
	const dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);

	return dec;
}

module.exports.cmdInputReader = function(dataHandler) {
	const stdin = process.openStdin();

	stdin.addListener('data', d => {
		dataHandler(d.toString().trim());
	});
}

module.exports.randomBytes = randomBytes;
module.exports.randomBetween = Math.randomBetween;