function quotesHandlerLoader() {
	function error() {
		// TODO
	}

	fetch('/quote').then(response => {
		response.json().then(json => {
			if (json.success) {
				const div = document.createElement('div');
				const match = json.data.content.match(/(<p>)(.+)(<\/p>)/);

				div.innerHTML = `<a href="${json.data.link}">&quot;${match[2].trim()}&quot;</a><span>- ${json.data.title}</span>`;
				document.getElementById('quote').appendChild(div);
			} else error(json.error);
		});
	}).catch( err => {
		console.error('An error occurred', err);
	});
}