/* Array */
Array.prototype.contains = function(string) {
	if (this.indexOf(string) >= 0) {
		return true;
	} else {
		return false;
	}
};

Array.prototype.random = function() {
	const arr = this;

	return arr[Math.floor(Math.random() * arr.length)];
}

Array.prototype.remove = function(search) {
	// const arr = this;

	// arr.forEach((object, key) => {
	// 	if (object == search) {
	// 		arr.splice(key, 1);
	// 	}
	// });

	// return arr;

	return this.filter(elem => {return elem != search;});
}

// Quickest way to sort
Array.prototype.quickSort = function() {
	if (this.length <= 1) {
		return this;
	}

	const pivotPos = Math.floor(this.length / 2);
	const pivotValue = this[pivotPos];

	let less = [],
	more = [],
	same = [];

	for (let i = 0; i < this.length; i++) {
		if (this[i] === pivotValue) {
			same.push(this[i]);
		} else if (this[i] < pivotValue) {
			less.push(this[i]);
		} else {
			more.push(this[i]);
		}
	}

	return less.quickSort().concat(same, more.quickSort());
};

/* Strings */
String.prototype.remove = function(substring) {
	return this.replace(substring, '');
};

String.prototype.random = function(length) {
	let newStr = '';
	const chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

	for (let i = 0; i < length; i++) {
		newStr += chars.random();
	}
}

/* Numbers */
/*
- beginningNumber(minCurrentRange, maxCurrentRange, minTargetRange, maxTargetRange)
- https://p5js.org/reference/#/p5/map
*/
Number.prototype.map = function(start1, stop1, start2, stop2) {
	return ((this - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};

Number.prototype.between = function(a, b) {
	let min = Math.min.apply(Math, [a, b]);
	let max = Math.max.apply(Math, [a, b]);

	return this > min && this < max;
};

/* HTML Elements */
Object.prototype.jsonStyle = function(json) {
	for (key in json) {
		// For some weird reason the for loop returns jsonStyle. I don't know why, someone please explain me.
		if (key !== 'jsonStyle') {
			// Converting the - character
			const regEx = /(.+)-(.+)/g;
			const regexArray = regEx.exec(key);

			if (regexArray) {
				this.style[regexArray[1] + regexArray[2].charAt(0).toUpperCase() + regexArray[2].slice(1)] = json[key];
			} else {
				this.style[key] = json[key];
			}
		}
	}

	return this;
};

/* URL */
Location.prototype.getAttributes = function() {
	const json = {};
	const url = window.location.search.substr(1);

	url.split('&').forEach((object, key) => {
		const regEx = /^(.+)=(.+)$/;
		const values = regEx.exec(object);

		let name = values[1];
		let value = values[2];

		json[name] = value;
	});

	return json;
}
// Use like: location.getAttributes()