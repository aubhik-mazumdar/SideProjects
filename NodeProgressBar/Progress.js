'use strict';

class Progress {
	constructor(response) {
		this._progress = 0;
		this._response = response;
		this._id = (new Date()).toLocaleTimeString() + '-' + randomString(5);

		response.header({
			"Cache-Control": "no-cache",
			"Content-Type": "text/event-stream"
		});

		this.end = this.closeConnection;
		this.close = this.closeConnection;
		this.update = this.sendProgress;

		function randomString(length) {
			let newStr = '';
			const chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

			for (let i = 0; i < length; i++) {
				newStr += chars[Math.floor(Math.random() * chars.length)];
			}

			return newStr;
		}
	}

	closeConnection(moreData) {
		const json = {done: true, progress: this._progress};

		if (moreData) {
			if (moreData.constructor == {}.constructor)
				json.data = moreData;
		}

		this.constructSSE(this._response, this._id, JSON.stringify(json));
		this._response.end();
	}

	sendProgress(percentage, moreData) {
		const json = {done: false, progress: percentage};

		if (moreData) {
			if (moreData.constructor == {}.constructor)
				json.data = moreData;
		}

		this._progress = percentage;
		this.constructSSE(this._response, this._id, JSON.stringify(json));
	}

	constructSSE(response, id, data) {
		response.write('id: ' + id + '\n');
		response.write("data: " + data + '\n\n');
	}
}

module.exports = (progressFunction, fileLocation, url, app, progressLocation, fs, path) => {
	const clientJsModule = require('./clientJs.js');

	fs = fs || require('fs');
	path = path || require('path');

	if (path.extname(fileLocation) == '.html') {
		if (progressFunction instanceof Function) {
			if (progressFunction && fileLocation && app) {
				progressLocation = progressLocation || 'progress';

				app.get(`*${progressLocation}*`, (request, response) => {
					progressFunction(new Progress(response), request, response);
				});

				app.get(url, (request, response) => {
					fs.exists(fileLocation, exists => {
						if (exists) {
							fs.readFile(fileLocation, 'utf-8', (err, data) => {
								if (err) {
									console.error(err);
									response.header(500).send('Something went wrong with reading the file');
								} else {
									data = data.replace(/require\((\"|\')progress(\"|\')\);?/i, clientJsModule.replace('{{progressLocation}}', progressLocation));
									response.header({'Content-Type': 'text/html; charset=utf-8'}).send(data);
								}
							});
						} else response.header(404).send('File not found');
					});
				});
			} else console.error('Missing parameters');
		} else console.error('Progress function missing');
	} else console.error('Specified file is not an HTML-file');

	return app;
}