'use strict';

const path= require('path');

const getAllStatsInPath = require('./getAllStatsInPath');

module.exports = function getParentDirectoryContainingFile (cwd, configFileName) {
	return getAllStatsInPath(cwd, true)
		.then(stats => stats.find(stat => stat.file && path.basename(stat.path) === configFileName)
			? cwd
			: cwd === '/' // @TODO: Fix that this is probably not gonna work on windows // @TODO: give a shit
				? null
				: getParentDirectoryContainingFile(path.dirname(cwd), configFileName)
	);
};

module.exports.sync = function getParentDirectoryContainingFileSync(cwd, configFileName) {
	return getAllStatsInPath.sync(cwd, true)
		.find(stat => stat.file && path.basename(stat.path) === configFileName)
			? cwd
			: cwd === '/' // @TODO: Fix that this is probably not gonna work on windows // @TODO: give a shit
				? null
				: getParentDirectoryContainingFileSync(path.dirname(cwd), configFileName)
};
