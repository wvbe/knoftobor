'use strict';

const spawnProcess = require('../primitives/executeInDir');

function filterPushed (targetPath) {
	return spawnProcess(targetPath, ['git', 'cherry', '-v'])
		.then((messages) => {
			return messages.length > 0;
		});
}

module.exports = app => app.filters.addFilter(
	'is-ahead',
	filterPushed,
	'Only results that have unpushed commits'
);
