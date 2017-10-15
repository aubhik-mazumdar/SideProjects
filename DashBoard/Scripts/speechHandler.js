let recognition, buttonElem;

if ('webkitSpeechRecognition' in window) {
	let alreadyTalked = false;
	const speachSynth = window.speechSynthesis;
	const speekingVoice = speachSynth.getVoices()[0];
	const speechSynthesisUtterance = new SpeechSynthesisUtterance();

	speechSynthesisUtterance.lang = 'en-GB';
	speechSynthesisUtterance.voice = speekingVoice;

	recognition = new webkitSpeechRecognition();
	recognition.interimResults = true;
	recognition.continuous = true;
	recognition.lang = 'en-GB';

	recognition.onstart = function() {
		alreadyTalked = false;
		buttonElem.style.border = '2px red solid';
	}

	recognition.onend = function() {
		buttonElem.style.border = 'none';
	}

	recognition.onerror = function(evt) {
		console.log('Error: ', evt);
		buttonElem.style.border = '5px red dotted';
	}

	recognition.onresult = function(evt) {
		if (!alreadyTalked) {
			let final_transcript = '';
			let interim_transcript = '';

			for (let i = evt.resultIndex; i < evt.results.length; ++i) {
				if (evt.results[i].isFinal)
					final_transcript += evt.results[i][0].transcript;
				else
					interim_transcript += evt.results[i][0].transcript;
			}

			const checkString = interim_transcript.trim().toLowerCase();
			if (checkString.indexOf('stop') > -1) {
				recognition.stop();
				alreadyTalked = true;
			} else if (checkString.indexOf('time') > -1) {
				speechSynthesisUtterance.text = timeText();
				speachSynth.speak(speechSynthesisUtterance);
				recognition.stop();
				alreadyTalked = true;
			} else if (checkString.indexOf('date') > -1) {
				speechSynthesisUtterance.text = dateText();
				speachSynth.speak(speechSynthesisUtterance);
				recognition.stop();
				alreadyTalked = true;
			} else if (checkString.indexOf('quote') > -1) {
				const quoteElem = document.getElementById('quote').querySelector('div');
				const quoteText = quoteElem.querySelector('a').innerText;
				const quoteAuthor = quoteElem.querySelector('span').innerText.replace('- ', '');

				speechSynthesisUtterance.text = `${quoteText} by ${quoteAuthor}`;
				speachSynth.speak(speechSynthesisUtterance);
				recognition.stop();
				alreadyTalked = true;
			}
		}
	}
}

function speechHandlerLoader() {
	const micElem = document.getElementById('mic');

	buttonElem = micElem.querySelector('button');
	if (!('webkitSpeechRecognition' in window)) {
		micElem.style.display = 'none';
		return;
	}

	micElem.addEventListener('click', evt => {
		final_transcript = '';

		recognition.start();
	});
}

function timeText() {
	const date = new Date();
	const minutes = date.getMinutes();

	let beforeAfter = 'past';
	let minuteString = minutes;
	let hour = date.getHours();

	if (minutes >= 30) {
		beforeAfter = 'before';
		minuteString = 60 - minutes;
		hour++;
	}

	if (hour > 12)
		hour -= 12;

	return `It is ${minuteString} ${beforeAfter} ${hour}`;
}

function dateText() {
	let dayString = '';
	const date = new Date();
	const day = date.getDate();
	const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

	if (day == 1)
		dayString = 'first';
	else if (day == 2)
		dayString = 'second';
	else if (day == 3)
		dayString = 'third';
	else
		dayString = day + 'th';

	return `It is ${months[date.getMonth()]} the ${dayString} of ${date.getFullYear()}`;
}