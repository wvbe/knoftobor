'use strict';

const spawnProcess = require('../primitives/executeInDir');

/**
 * Filter repositories where HEAD is behind on FETCH_HEAD
 * @param targetPath
 * @param filterOption
 * @returns {*}
 */
function filterIsCommitsBehind (targetPath) {
	return spawnProcess(targetPath, ['git', 'log', 'HEAD..FETCH_HEAD', '--oneline'])
		.then((messages) => {
			return messages.length >= 1;
		});
}

module.exports = app => app.filters.addFilter(
	'is-behind',
	filterIsCommitsBehind,
	'Only results that are one or more commits behind from their remote counterpart'
);
