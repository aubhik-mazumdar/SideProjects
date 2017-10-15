function newsHandlerLoader() {
	function error() {
		// TODO
	}

	fetch('/news').then(response => {
		response.json().then(json => {
			if (json.success) {
				const newsElem = document.querySelector('.news');

				json.data.forEach((object, key) => {
					newsElem.innerHTML += `<a href="${object.url}" target="_blank" title="${object.title}">${object.title}</a>`;
				});
			} else error(json.error);
		});
	}).catch(err => {
		error(err);
	});
}