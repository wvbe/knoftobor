'use strict';

const spawnProcess = require('../primitives/executeInDir');

function filterOnRemoteBranch (targetPath, branchName) {
	return spawnProcess(targetPath, ['git', 'rev-parse', '--abbrev-ref', 'HEAD@{u}'])
		.then((messages) => {
			return messages.length === 1 &&
				messages[0].data.toString().replace(/\n/gi, '') === 'origin/' + branchName;
		});
}

module.exports = app => app.filters.addFilter(
	'on-remote-branch',
	filterOnRemoteBranch,
	'Only results that are on a given remote branch name'
);
