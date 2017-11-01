// module.exports = `new class Test {
// 	constructor() {
// 		var evtSource = new EventSource("/progress");

// 		console.log(evtSource);

// 		evtSource.onmessage = function(e) {
// 			var newElement = document.createElement("li");

// 			try {
// 				if (JSON.parse(e.data).done) {
// 					evtSource.close();
// 				} else {
// 					console.log(JSON.parse(e.data));
// 				}
// 			} catch (err) {
// 				console.log(err);
// 			}

// 			newElement.innerHTML = "message: " + e.data;
// 			document.body.appendChild(newElement);
// 		}
// 	}
// }
// `;

module.exports = `function(func) {
	var evtSource = new EventSource("/progress");

	console.log(evtSource);

	evtSource.onmessage = function(e) {
		try {
			if (JSON.parse(e.data).done)
				evtSource.close();
			else
				func(JSON.parse(e.data));
		} catch (err) {
			console.log(err);
		}
	}
} `;