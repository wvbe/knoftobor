'use strict';

const spawnProcess = require('../primitives/executeInDir');

function filterHasBranch (targetPath, branchName) {
	return spawnProcess(targetPath, ['git', 'branch', '--list', branchName])
		.then((messages) => {
			return messages.length >= 1;
		});
}

module.exports = app => app.filters.addFilter(
	'has-branch',
	filterHasBranch,
	'Only results that have a given branch name locally'
);
