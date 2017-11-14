module.exports = `function(func) {
	var evtSource = new EventSource("/progress");

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