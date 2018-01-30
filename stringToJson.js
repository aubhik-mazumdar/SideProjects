function checkForList(string, breakString, availableTags) {
	let index = 0;
	let prevKey = 0;
	let prevIndex = 0;
	let lastIndentation = 0;

	const listArr = [];

	function checkIndentation(str) {
		const match = str.match(/^(\s+)(.+)$/);

		if (match) {
			if (match[1])
				return match[1].length;
			else
				return 0;
		} else return 0;
	}

	function filterArray(arr) {
		const outpArr = arr.filter(val => {
			return (val != undefined && val != null);
		}).filter((val, index, self) => {
			return index === self.indexOf(val.trim());
		}).filter(val => {
			return val.trim() != '';
		});

		return {
			string: arr[5],
			regExpMatchValue: outpArr
		};
	}

	function joinStrings(arr, breakString) {
		breakString = breakString || ' ';

		for (let i = 0; i < arr.length - 1; i++) {
			const current = arr[i];
			const next = arr[i + 1];

			if (typeof current == 'string' && typeof next == 'string') {
				arr[i + 1] = current + breakString + next;
				arr.splice(i, 1);
			}
		}

		return arr;
	}

	breakString = breakString || '<br>';
	string.split(breakString).forEach(function(object, key) {
		if (!availableTags)
			availableTags = ['-', '*', '+', '#'];

		const regEx = new RegExp(`^((\\s+)?(${availableTags.map(val => {return '\\' + val}).join('|')})(\\s+)?)(.+)`);

		const indentation = checkIndentation(object);
		const strArr = object.match(regEx);

		if (lastIndentation < indentation)
			index++;
		else if (lastIndentation > indentation)
			index--;

		lastIndentation = indentation;

		if (strArr) {
			const val = filterArray(strArr);

			if (key == prevKey + 1) {
				if (listArr[listArr.length - 1] instanceof Array)
					listArr[listArr.length - 1].push({index: index, value: val});
				else
					listArr.push([{index: index, value: val}]);
			} else {
				listArr.push([{index: index, value: val}]);
			}

			prevKey = key;
		} else if (object != '') {
			listArr.push(object);
		}
	});

	return joinStrings(listArr, ' ');
}

const str = `Test<br>Yay<br>- List item 1<br>- List item 2<br>  - List indexed<br>Word<br>Test`;

console.log(checkForList(str));