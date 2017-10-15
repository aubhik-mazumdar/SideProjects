function clockHandlerLoader(username) {
	const clockElem = document.getElementById('clock');

	function twoDigits(num) {
		if (num > 9)
			return num;
		else
			return '0' + num;
	}

	function updateInterface() {
		let timeOfDay = 'Hello';
		const date = new Date();
		const hours = twoDigits(date.getHours());
		const minutes = twoDigits(date.getMinutes());

		if (hours < 12)
			timeOfDay = 'Good morning';
		else if (hours < 18)
			timeOfDay = 'Good afternoon';
		else
			timeOfDay = 'Good evening';

		clockElem.innerHTML = `<span>${hours}:${minutes}</span><span>${timeOfDay}, ${username}</span>`;
	}

	updateInterface();
	setInterval(updateInterface, 30000);
}