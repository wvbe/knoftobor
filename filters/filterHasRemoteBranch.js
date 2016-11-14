'use strict';

const spawnProcess = require('../primitives/executeInDir');

function filterHasRemoteBranch (targetPath, branchName) {
	return spawnProcess(targetPath, ['git', 'branch', '-r', '--list', 'origin/' + branchName])
		.then((messages) => {
			return messages.length >= 1;
		});
}

module.exports = app => app.filters.addFilter(
	'has-remote-branch',
	filterHasRemoteBranch,
	'Only results that have a given branch name remotely'
);
