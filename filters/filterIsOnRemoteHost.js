'use strict';
const url = require('url');
const path = require('path');
const gitRemoteOriginUrl = require('git-remote-origin-url');

/**
 * Filter repositories where HEAD is behind on FETCH_HEAD
 * @param targetPath
 * @param filterOption
 * @returns {*}
 */
function filterIsOnRemoteHost (targetPath, hostname) {
	return gitRemoteOriginUrl(targetPath)
		.then(remoteUrl => {
			if (!remoteUrl.includes('://'))
				remoteUrl = 'protocol://' + remoteUrl;

			return url.parse(remoteUrl).hostname === hostname;
		});
}

module.exports = app => app.filters.addFilter(
	'origin-url',
	filterIsOnRemoteHost,
	'Only results who have their origin set to a given host'
);
