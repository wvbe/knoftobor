'use strict';

const fs = require('fs');
const path = require('path');

const getParentDirectoryContainingFile = require('../primitives/getParentDirectoryContainingFile');

const LOCATION = Symbol('configuration file location');
const FILE_NAME = Symbol('configuration file name, ".${appName}rc"');
class ConfigManager {
	constructor (applicationName) {
		this[LOCATION] = null;
		this[FILE_NAME] = `.${applicationName}rc`;

		this.findInDirsAncestry([process.cwd()]);
	}

	findInDirsAncestry (dirs) {
		var configLocation = dirs
			.map(dir => {
				try {
					return getParentDirectoryContainingFile.sync(dir, this.getFileName())
				} catch (err) {
					return false; // Ignore directories that cannot be read
				}
			})
			.find(result => !!result);

		if (!configLocation)
			return;

		this[LOCATION] = path.resolve(configLocation, this.getFileName());

		this.read();

		return true;
	}

	read () {
		Object.assign(this, JSON.parse(fs.readFileSync(this[LOCATION], 'utf-8')));
	}

	getPath () {
		return this[LOCATION];
	}

	getFileName () {
		return this[FILE_NAME];
	}

	toString () {
		return JSON.stringify(Object.keys(this)
			.reduce((sanitized, propertyName) => {
				if (propertyName.charAt(0) === '_')
					return sanitized;

				if(typeof this[propertyName] === 'function')
					return sanitized;

				if(propertyName === 'modules')
					return sanitized;

				sanitized[propertyName] = this[propertyName];

				return sanitized;
			}, {}), null, '\t');
	}
}

module.exports = ConfigManager;
