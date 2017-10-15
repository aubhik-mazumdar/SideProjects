function notesHandlerLoader() {
	function error() {
		// TODO
	}

	fetch('/todo').then(response => {
		response.json().then(json => {
			if (json.success) {
				const elem = document.querySelector('.todos');

				json.data.forEach((object, key) => {
					elem.innerHTML += `<div><p>${object.name}</p><span>${object.description}</span></div>`;
				});
			} else error();
		});
	}).catch(err => {
		console.error('An error occurred', err);
	});
}