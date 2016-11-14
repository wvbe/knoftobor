'use strict';

const spawnProcess = require('../primitives/executeInDir');

function filterOnBranch (targetPath, branchName) {
	return spawnProcess(targetPath, ['git', 'rev-parse', '--abbrev-ref', 'HEAD'])
		.then((messages) => {
			return messages.length === 1 && (branchName
				? messages[0].data.toString().replace(/\n/gmi, '') === branchName
				: messages[0].data.toString().replace(/\n/gmi, '') !== 'HEAD');
		});
}

module.exports = app => app.filters.addFilter(
	'on-branch',
	filterOnBranch,
	'Only results that are on a given local branch name'
);
