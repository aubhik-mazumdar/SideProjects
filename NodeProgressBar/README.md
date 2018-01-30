# Node Progress Bar
A simple NodeJs module for sending progress from the server to the client.

## Documentation
**Requires Express**

First you need to import *Progress*. This handles setting up the server side page and clientside API.

The imported *Progress* object is a function, so you need to call it. It requires the following arguments:

- **progressFunction**: This function handles sending and stopping the progress. Its argument is a class:
	- **update**: The function sends a message to the client.
	- **end**: Closes the connection.
	**You can also send more data into these functions as a second argument.**
- **fileLocation**: The path of the file that handles the client side progress event. *Progress* automatically creates a server get handler for this file.
- **url**: The URL that the user has to type into the address bar. This is the same as you would put into `app.get`
- **app**: The *Express* function
- **progressLocation**: The location that you have to go to to receive the progress values. Defaults to *progress*.

You can also pass *fs*, and *path* (in that order) after the required arguments.

The request and response attributes are also available as the second and third arguments in the *progressFunction*.


The client file can now require *Progress* like this:
```JavaScript
const Progress = require('Progress');

Progress(p => {
	let i = 0;

	const int = setInterval(() => {
		if (i > 10) {
			p.close();
			clearInterval(int);
		} else {
			p.update(i / 10 * 100, {
				isCool: true
			});
			i++;
		}
	}, 1000);
}, __dirname + '/index.html', '*', app, 'WebURL' /*, fs, path*/);
```

The passed object is a function that gets called when the server sends a progress event. This function also returns the EventSource.

Take a look at the example files in this folder for a better explanation.