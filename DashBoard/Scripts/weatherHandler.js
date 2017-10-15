function weatherHandlerLoader() {
	function skycons(weatherType) {
		const icon = new Skycons({
			"color" : "#FFFFFF",
			"resizeClear": true
		});

		icon.set(document.getElementById('weatherIcon'), weatherType);
		icon.play();
	}

	navigator.geolocation.getCurrentPosition(evt => {
		const lat = evt.coords.latitude;
		const long = evt.coords.longitude;

		function error(err) {
			// TODO
		}

		fetch(`/weather/${lat},${long}`).then(response => {
			response.json().then(json => {
				if (json.success) {
					const weather = json.data.currently;
					const div = document.createElement('div');

					console.log(weather);
					div.innerHTML = `<canvas id="weatherIcon" width="25" height="25"></canvas><span>${Math.round(weather.temperature)}°C</span><span>${weather.summary}</span>`;
					skycons(weather.icon);
					document.body.querySelector('.weather').appendChild(div);
				} else error(json.error);
			});
		}).catch(err => {
			console.error('An error occurred', err);
		});
	});
}