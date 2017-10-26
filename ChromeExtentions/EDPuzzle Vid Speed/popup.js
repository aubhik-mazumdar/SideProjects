function getCurrentTabUrl(callback) {
	const queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, (tabs) => {
		const tab = tabs[0];
		const url = tab.url;

		console.assert(typeof url == 'string', 'tab.url should be a string');
		callback(url, tab);
	});
}

function executeScript(string) {
	chrome.tabs.executeScript({
		code: string
	});
}

function log(...data) {
	executeScript(`console.log(${data.map(val => {return `"${val}"`}).join(', ')})`)
}

document.addEventListener('DOMContentLoaded', () => {
	function changeVidSpeed(speed) {
		if (typeof speed == 'number') {
			const data = {
				event: 'command',
				func: 'setPlaybackRate',
				args: [speed, true]
			};

			console.log(`document.getElementById('edp-youtube-video-player').contentWindow.postMessage(JSON.stringify(${JSON.stringify(data)}), '*')`);
			executeScript(`document.getElementById('edp-youtube-video-player').contentWindow.postMessage(JSON.stringify(${JSON.stringify(data)}), '*')`);
		}
	}

	getCurrentTabUrl((url, tab) => {
		url = new URL(url.toString());

		if (url.hostname == "edpuzzle.com") {
			document.getElementsByTagName('input')[0].addEventListener('change', evt => {
				document.getElementById('speed').innerText = evt.target.value;
			});

			document.getElementsByTagName('button')[0].onclick = evt => {
				log(Number(document.getElementById('speed').innerText));
				changeVidSpeed(Number(document.getElementById('speed').innerText));
				window.close();
			}
		} else {
			document.body.innerHTML = '<p>Geen EDPuzzle URL</p>';
		}
	});
});
