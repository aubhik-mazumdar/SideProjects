function githubHandlerLoader() {
	function error() {
		// TODO
	}

	fetch('/githubNotifications').then(response => {
		response.json().then(json => {
			if (json.success) {
				const elem = document.querySelector('.github');

				if (json.data.length > 0) {
					json.data.forEach((object, key) => {
						// TODO
					});
				} else elem.innerHTML = '<i>No notifications.</i>';
			} else error(json.error);
		});
	}).catch(err => {
		error(err);
	});
}