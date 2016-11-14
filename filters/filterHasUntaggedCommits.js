'use strict';

const spawnProcess = require('../primitives/executeInDir');

function filterHasUntaggedCommits (targetPath) {
	return spawnProcess(targetPath, ['git', 'describe', '--tags'])
		.then((messages) => {
			messages = messages.map((message) => message.data.toString().split('\n'))
				.reduce((flattenedMessages, messageLines) => {
					flattenedMessages = flattenedMessages.concat(messageLines);
					return flattenedMessages;
				}, [])
				.filter((message) => message.length > 0);
			const tagVersion = messages.pop();
			return tagVersion.indexOf('-') !== -1;
		});
}

module.exports = app => app.filters.addFilter(
	'untagged',
	filterHasUntaggedCommits,
	'Only results that have untagged commits'
);
