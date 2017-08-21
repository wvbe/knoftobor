'use strict';

const path = require('path');



module.exports = app => app.filters.addFilter(
	'path-contains',
	function filterPathContains (targetPath, prefixString) {
		return Promise.resolve(targetPath.includes(prefixString));
	},
	'Only repositories whose full path contains ...'
);
