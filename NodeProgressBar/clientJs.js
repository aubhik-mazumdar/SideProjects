module.exports = `function(func) {
	var evtSource = new EventSource("/{{progressLocation}}");

	evtSource.onmessage = function(e) {
		try {
			if (JSON.parse(e.data).done)
				evtSource.close();
			else
				func(JSON.parse(e.data), e.data);
		} catch (err) {
			console.log(err);
		}
	}

	return evtSource;
} `;