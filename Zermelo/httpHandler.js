const querystring = require('querystring');
const URLModule = require('url');
const https = require('https');

function __mainRequestHandler(options, post_data) {
	return new Promise((resolve, reject) => {
		const req = https.request(options, res => {
			if (res.statusCode !== 200 && res.statusCode !== 302) {
				reject(res.statusCode);
			} else if (res.statusCode === 302 || res.statusCode === 200) {
				let outp = '';

				res.setEncoding('utf8');
				res.on('data', chunk => {
					outp += chunk;
				});
				res.on('end', () => {
					if (res.headers['content-type'].toLowerCase().indexOf('application/json') > -1) {
						try {
							resolve({
								type: 'json',
								data: JSON.parse(outp)
							});
						} catch (err) {
							reject(err);
						}
					} else resolve({
						type: 'text',
						data: outp
					});
				});
				res.on('error', reject);
			} else reject(res.statusCode);
		});

		if (post_data)
			req.write(post_data);

		req.end();
	});
}

module.exports = {
	get: (url, parameters) => {
		const get_options = URLModule.parse(url);

		if (!get_options.headers)
			get_options.headers = {};

		if (parameters)
			get_options.headers.body = JSON.stringify(parameters);

		return __mainRequestHandler(get_options);
	},
	post: (url, data, headers) => {
		/*return new Promise((resolve, reject) => {
			resolve({
				type: 'json',
				data: JSON.parse('{"access_token": "rjendmibe8jefvk8s7v4ejjtnp", "token_type": "bearer", "expires_in": 57600 }')
			});
		});*/

		const post_options = URLModule.parse(url);
		const post_data = querystring.stringify(data);

		if (!headers) headers = {};

		headers['Accept'] = '*/*';
		headers['User-Agent'] = 'curl/7.35.0';
		headers['Content-Type'] = 'application/x-www-form-urlencoded';
		headers['Content-Length'] = Buffer.byteLength(post_data);

		post_options.method = 'POST';
		post_options.headers = headers;
		return __mainRequestHandler(post_options, post_data);
	}
}