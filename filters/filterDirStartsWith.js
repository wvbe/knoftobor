'use strict';

const path = require('path');

module.exports = app => app.filters.addFilter(
	'dir-starts-with',
	function filterDirStartsWith (targetPath, prefixString) {
		return Promise.resolve(path.basename(targetPath).indexOf(prefixString) === 0);
	},
	'Only repositories whose directory starts with ...'
);
