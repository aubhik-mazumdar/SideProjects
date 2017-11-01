// 'use strict';

// class Progress {
// 	constructor(response) {
// 		this.progress = 0;
// 		this._response = response;
// 		this._id = (new Date()).toLocaleTimeString();

// 		response.header({
// 			"Cache-Control": "no-cache",
// 			"Content-Type": "text/event-stream"
// 		});

// 		this.end = this.closeConnection;
// 		this.close = this.closeConnection;

// 		this.update = this.sendProgress;
// 		this.progress = this.sendProgress;
// 	}

// 	closeConnection() {
// 		this.constructSSE(this._response, this._id, `{"done": true, "progress": ${this.progress}}`);
// 		this._response.end();
// 	}

// 	sendProgress(percentage) {
// 		this.progress = percentage;
// 		this.constructSSE(this._response, this._id, `{"done": false, "progress": ${percentage}}`);
// 	}

// 	constructSSE(response, id, data) {
// 		response.write('id: ' + id + '\n');
// 		response.write("data: " + data + '\n\n');
// 	}
// }

// module.exports = Progress;

'use strict';

class Progress {
	constructor(response) {
		this.progress = 0;
		this._response = response;
		this._id = (new Date()).toLocaleTimeString();

		response.header({
			"Cache-Control": "no-cache",
			"Content-Type": "text/event-stream"
		});

		this.end = this.closeConnection;
		this.close = this.closeConnection;

		this.update = this.sendProgress;
		this.progress = this.sendProgress;
	}

	closeConnection() {
		this.constructSSE(this._response, this._id, `{"done": true, "progress": ${this.progress}}`);
		this._response.end();
	}

	sendProgress(percentage) {
		this.progress = percentage;
		this.constructSSE(this._response, this._id, `{"done": false, "progress": ${percentage}}`);
	}

	constructSSE(response, id, data) {
		response.write('id: ' + id + '\n');
		response.write("data: " + data + '\n\n');
	}
}

module.exports = (progressFunction, fileLocation, url, app, fs, path) => {
	const clientJsModule = require('./clientJs.js');

	fs = fs || require('fs');
	path = path || require('path');

	if (path.extname(fileLocation) == '.html') {
		if (progressFunction instanceof Function) {
			if (progressFunction && fileLocation && app) {
				app.get('*progress*', (request, response) => {
					progressFunction(new Progress(response));
				});

				app.get(url, (request, response) => {
					fs.exists(fileLocation, exists => {
						if (exists) {
							fs.readFile(fileLocation, 'utf-8', (err, data) => {
								if (err) {
									console.error(err);
									response.header(500).send('Something went wrong with reading the file');
								} else {
									data = data.replace(/require\((\"|\')progress(\"|\')\);/i, clientJsModule);
									response.header({'Content-Type': 'text/html; charset=utf-8'}).send(data);
								}
							});
						} else response.header(404).send('File not found');
					});
				});
			} else console.error('Missing parameters');
		} else console.error('Progress function missing');
	} else console.error('Specified file is not an HTML-file');
}