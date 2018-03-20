const windowsAppSynonyms = require('./WindowsAppSynonyms.js');
const tmpFileLoc = __dirname + '/tmp.json';
const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');

let apps = {};

/* Main logic */
function osOk(moreInfo) {
	// Only works on Windows
	if (os.platform() == 'win32') {
		// Windows Metro apps are only supported on Windows 8 and newer
		if (Number(os.release().split('.')[0]) >= 8)
			return true;
		else if (moreInfo)
			return 'OS-version is lower than Windows 8. Windows apps are only supported on Windows 8 and newer'
	} else if (moreInfo) {
		return 'Not running windows';
	}

	return false;
}

function fetchAppsList() {
	// Runs powershell with a command to fetch all the installed apps
	return new Promise((resolve, reject) => {
		exec('powershell.exe -c "Get-AppxPackage"', (err, stdout, stderr) => {
			if (err)
				reject(err);
			else if (stderr)
				reject(stderr);
			else
				resolve(stdout);
		});
	});
}

function parseCommandData(data) {
	// Responsible for parsing and digesting the output of the powershell command

	// Remove all the weird Windows line-breaks. Then split the total information into app-specific chuncks
	const bigDataChunckArray = data.trim().replace(/\r/g, '').split('\n\n');
	const padding = findPadding(bigDataChunckArray[0].split('\n')[0]);
	const paddingRegExp = new RegExp(`\n${padding}`, 'g');
	const outpDataObj = {};

	// The powershell command adds padding and line wrapping to the output. We need to find the padding length in order to remove it
	function findPadding(str) {
		const match = str.match(/((\w+)(\s+)\:(\s+))/);

		return (match != null) ? match[1] : '';
	}

	bigDataChunckArray.map(val => {
		// Remove wordwrap
		return val.replace(paddingRegExp, '').split('\n')
	}).map(val => {
		// Split each app-specific chunck into lines
		return val.map(val => val.split(/\s+?:\s+?/));
	}).forEach((object, key) => {
		// Generate an Object from each line

		const newObj = {};

		object.forEach(val => {
			let value = val[1];

			if (value == 'True')
				value = true;
			else if (value == 'False')
				value = false;

			newObj[val[0]] = value;
		});

		outpDataObj[object[0][1]] = newObj;
	});

	return outpDataObj;
}

function fetchAndParseManifest(data, sync, filterRedirectNames) {
	// Reads the app's AppxManifest.xml file and geathers usefull information

	const appPath = data['InstallLocation'];

	const getFolderFromPath = path => {
		// Returns the folder of the filePath

		path = path.replace(/(\\)+/g, '/').split('/').filter(val => val.trim().length > 0);
		const val = path.pop().split('.');

		val.pop();
		return [val.join('.'), path.join('/')];
	}

	const getImageLoc = d => {
		// Finds the icon location in the manifest and checks it. Some image descriptions are a bit wonky so this function also deals with that

		const path = appPath + '/' + d.match(/(\<Logo\>)(.+)(\<\/Logo\>)/)[2];

		if (fs.existsSync(path))
			return path;
		else {
			const folderData = getFolderFromPath(path);

			try {
				const files = fs.readdirSync(folderData[1]);
				const imageFiles = [];

				if (files) {
					for (let i = 0; i < files.length; i++) {
						if (files[i].indexOf(folderData[0]) > -1)
							return folderData[1] + '/' + files[i];

						if (files[i].match(/(\.(jpe?g|png))$/))
							imageFiles.push(folderData[1] + '/' + files[i])
					}

					if (imageFiles.length > 0)
						return imageFiles[0];
					else
						return null;
				}
			} catch (err) {}

			return null;
		}
	}

	const getData = d => {
		// Geathers all interesting information in the manifest using regular expressions

		const outp = {
			appIconLocation: getImageLoc(d),
			appName: d.match(/(\<DisplayName\>)(.+)(\<\/DisplayName\>)/)[2],
			appId: d.match(/(<Application)(\s+|\n+)?(Id="(.*?)")/)[4] || null
		}

		if (d.match(/Description="(.*?)"/)) {
			const matchContent = d.match(/Description="(.*?)"/)[1]

			if (!matchContent.startsWith('ms-resource:'))
				outp['appDescription'] = matchContent;
		}

		if (d.match(/BackgroundColor="(.*?)"/))
			outp['BackgroundColor'] = d.match(/BackgroundColor="(.*?)"/)[1];

		// We don't want a ms-resource name. That's useless
		if (outp.appName.startsWith('ms-resource:'))
			delete outp.appName;

		if (data.Name in windowsAppSynonyms) {
			if (windowsAppSynonyms[data.Name] != false)
				outp.appName = windowsAppSynonyms[data.Name];
		}

		return outp;
	}

	if (appPath.length > 0) {
		if (sync) {
			try {
				const data = fs.readFileSync(appPath + '/AppxManifest.xml', 'utf-8');

				if (data)
					return getData(data);
				else
					return 'No data found';
			} catch (err) {
				return err;
			}
		} else {
			return new Promise((resolve, reject) => {
				fs.readFile(appPath + '/AppxManifest.xml', 'utf-8', (err, data) => {
					if (err)
						reject(err);
					else
						resolve(getData(data));
				});
			});
		}
	} else if (!sync) {
		// return Promise.reject();
		return Promise.resolve();
	} else return null;
}

function startApp(appObj) {
	// Starts the Windows app

	const appId = appObj['manifestInfo']['appId'];

	return new Promise((resolve, reject) => {
		exec(`explorer.exe shell:appsFolder\\${appObj['PackageFamilyName']}!${(appId == null) ? 'App' : appId}`, (err, stdout, stderr) => {
			if (err)
				reject(err);
			else
				return ({
					out: stdout,
					err: stderr
				});
		});
	});
}


/* Exports */
const exportsObj = {
	init: () => {
		return new Promise((resolve, reject) => {
			const isOsOk = osOk(true);

			if (isOsOk == true) {
				fetchAppsList().then(apps => {
					const data = parseCommandData(apps);

					for (key in data) {
						// Exclude some apps
						if (key in windowsAppSynonyms) {
							if (windowsAppSynonyms[key] == false) {
								delete data[key];
								continue;
							}
						}

						// Frameworks are useless
						if (data[key]['IsFramework'] == true) {
							delete data[key];
							continue;
						}

						// Some apps are not labeled framework but they kind of are. We don't want to see them.
						if (key.match(/(\d|\w){8}-(\d|\w){4}-(\d|\w){4}-(\d|\w){4}-(\d|\w){12}/)) {
							delete data[key];
							continue;
						}

						data[key]['manifestInfo'] = fetchAndParseManifest(data[key], true, true);
					}

					fs.writeFile(tmpFileLoc, JSON.stringify(data), err => {
						if (err)
							throw err;
					});

					apps = data;
					resolve(data);
				}).catch(reject);
			} else reject('Could not geather Windows App info because ' + isOsOk);
		});
	},

	getApps: onlyNames => {
		return new Promise((resolve, reject) => {
			const fallback = () => {
				const appNames = Object.keys(apps);

				if (appNames.length > 0) {
					if (onlyNames)
						resolve(appNames);
					else
						resolve(apps);
				} else {
					exportsObj.init().then(apps => {
						if (onlyNames)
							resolve(Object.keys(apps));
						else
							resolve(apps);
					}).catch(reject);
				}
			}

			fs.exists(tmpFileLoc, exists => {
				if (exists) {
					fs.readFile(tmpFileLoc, 'utf-8', (err, data) => {
						if (err)
							fallback();
						else
							resolve(JSON.parse(data))
					});
				} else fallback();
			});
		});
	},

	start: startApp,
	open: startApp,
	checkOs: osOk,
	osOk: osOk,
};

module.exports = exportsObj;