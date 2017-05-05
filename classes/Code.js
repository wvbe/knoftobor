'use strict';

let path = require('path');

const gitRemoteOriginUrl = require('git-remote-origin-url');

const getShellOutput = require('../primitives/getShellOutput');
class Code {
	constructor (p, name) {
		this.path = p;
		this.name = name;
	}

	matchesAlias(alias) {
		return this.name === alias;
	}

	getVersionStatus () {
		return getVersionStatus(this.path);
	}

	getBranchName () {
		return getBranchName(this.path);
	}

	isDirty () {
		return getDirtyStatus(this.path);
	}

	getRemoteUrl () {
		try {
			return gitRemoteOriginUrl(this.path);
		} catch (err) {
			return Promise.reject(err);
		}
	}
}

function getDirtyStatus (p) {
	return getShellOutput(p, ['git', 'status', '--porcelain'])
		.then((messages) => messages.some(message => !!message));
}
function getBranchName (p) {
	return getShellOutput(p, ['git', 'rev-parse', '--abbrev-ref', 'HEAD'])
		.then((lines) => {
			if (lines.length !== 1)
				return null;

			let name = lines[0].replace(/\n/gmi, '');

			return name === 'HEAD'
				? null
				: name;
		});
}

function getVersionStatus (p) {
	return getShellOutput(p, ['git', 'describe', '--tags', '--long'])
		.then(lines => {
			if(!lines[0])
				return {
					tag: null,
					ahead: 0
				};

			let line = lines[0].substr(0, lines[0].length - 9);

			return {
				tag: line.substr(0, line.lastIndexOf('-')),
				ahead: parseInt(line.substr(line.lastIndexOf('-') + 1))
			};
		}).catch(err => ({
			tag: null,
			ahead: 0
		}));
}

module.exports = Code;
