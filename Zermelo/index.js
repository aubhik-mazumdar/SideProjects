const fs = require('fs');

const httpHandler = require('./httpHandler.js');
const utils = {
	zermeloAuthenticate: (userData) => {
		const tokenFileLocation = __dirname + '/ZermeloTokenData.json';

		function fetchToken() {
			return new Promise((resolve, reject) => {
				httpHandler.post(`https://${userData.school}.zportal.nl/api/v3/oauth/token`, {
					grant_type: 'authorization_code',
					code: userData.appCode.replace(/\s+/g, '')
				}).then(data => {
					if (data.type == 'json') {
						data = data.data;
						data.expires_in = Date.now() + data.expires_in;

						fs.writeFile(tokenFileLocation, JSON.stringify(data), err => {
							if (err)
								console.log('Error with writing file', err);

							resolve(data.access_token);
						});
					} else console.log('No JSON!');
				}).catch(reject);
			});
		}

		return new Promise((resolve, reject) => {
			fs.exists(tokenFileLocation, exists => {
				if (exists) {
					fs.readFile(tokenFileLocation, 'utf-8', (err, data) => {
						if (err) {
							console.log('There was an error reading the JSON file, so fetching from network.');
							fetchToken().then(resolve).catch(reject);
						} else {
							if (data.length > 0) {
								try {
									const jsonData = JSON.parse(data);

									if (jsonData.expires_in > Date.now())
										resolve(jsonData.access_token);
									else {
										fs.writeFile(tokenFileLocation, '', err => {
											if (err)
												console.log('Couldn\'t clear file. You have to to this yourself!');

											reject('Token expired');
										});
									}
								} catch (err) {
									reject(err);
								}
							} else fetchToken().then(resolve).catch(reject);
						}
					});
				} else fetchToken().then(resolve).catch(reject);
			});
		});
	},

	UNIXTimestampToReadable: (UNIXTimestamp) => {
		const date = new Date(UNIXTimestamp * 1000);
		const hours = date.getHours();
		const minutes = "0" + date.getMinutes();
		const seconds = "0" + date.getSeconds();

		return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
	},

	getResponseHandler: (response) => {
		if (response.type == 'json') {
			if (response.data.response) {
				if (response.data.response.status == 200) {
					return response.data.response.data;
				} else console.log('Response status is wrong');
			} else console.log('No Response');
		} else console.log('No JSON!');
	}
}

const userData = {
	school: 'xxxx',
	appCode: 'xxx xxx xxx xxx'
};

utils.zermeloAuthenticate(userData).then(token => {
	/*httpHandler.get(`https://${userData.school}.zportal.nl/api/v2/announcements?user=~me&current=true&access_token=${token}`).then(data => {
		const announcements = utils.getResponseHandler(data);

		announcements.forEach((object, key) => {
			console.log({
				text: object.text,
				title: object.title,
				startTimeDate: utils.UNIXTimestampToReadable(object.start),
				enTimeDate: utils.UNIXTimestampToReadable(object.end),
				origionalData: object
			});
		});
	}).catch(err => {
		console.log('Error: ', err);
	});*/

	let endUNIXStamp = new Date();
	let startUNIXStamp =  new Date();

	startUNIXStamp.setHours(0, 0, 0, 0);
	endUNIXStamp.setHours(23, 59, 59, 999);

	endUNIXStamp = Math.round(endUNIXStamp.getTime() / 1000);
	startUNIXStamp = Math.round(startUNIXStamp.getTime() / 1000);

	httpHandler.get(`https://${userData.school}.zportal.nl/api/v2/appointments?start=${startUNIXStamp}&end=${endUNIXStamp}&user=~me&access_token=${token}`).then(data => {
		const appointments = utils.getResponseHandler(data);

		appointments.forEach((object, key) => {
			/*console.log({
				startTimeDate: utils.UNIXTimestampToReadable(object.start),
				enTimeDate: utils.UNIXTimestampToReadable(object.end),
				origionalData: object
			});*/

			if (object.cancelled || object.modified || object.moved || object.new)
				console.log('Changed!', object.changeDescription);
			else console.log('Nothing!');
		});
	}).catch(err => {
		console.log('Error: ', err);
	});
}).catch(err => {
	console.log('Error Authenticating: ', err);
});