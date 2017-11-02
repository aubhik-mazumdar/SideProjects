// const Progress = require('./Progress.js');

// const Express = require('express');
// const app = Express();

// app.get('*progress*', (request, response) => {
// 	let i = 0;
// 	const p = new Progress(response);

// 	const int = setInterval(() => {
// 		console.log(i);
// 		if (i > 10) {
// 			p.close();
// 			clearInterval(int);
// 		} else {
// 			p.update(i / 10 * 100);
// 			i++;
// 		}
// 	}, 1000);
// });

// app.get('*', (request, response) => {
// 	response.sendFile(__dirname + '/main.html');
// });

// app.listen(8000, err => {
// 	if (err)
// 		console.error(err);
// 	else
// 		console.log('Running on port 8000');
// });



const Progress = require('Progress');
const Express = require('express');
const app = Express();

const ProgressHandler = Progress(p => {
	let i = 0;

	const int = setInterval(() => {
		console.log(i);
		if (i > 10) {
			p.close();
			clearInterval(int);
		} else {
			p.update(i / 10 * 100);
			i++;
		}
	}, 1000);
}, __dirname + '/index.html', '*', app);

app.listen(8000, err => {
	if (err)
		console.error(err);
	else
		console.log('Running on port 8000');
});