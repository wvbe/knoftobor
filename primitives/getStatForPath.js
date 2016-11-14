'use strict';

let fs = require('fs'),
	$path = require('path') /* renamed to avoid collisions */;

/**
 * @param {String} path - the path of whatchawanna
 * @param indiscriminateOfSymlinks - pretend symbolic links are just files or directories
 * @returns {*}
 */

function createExportForStat (stat) {
	return {
		path: stat.path,
		symlink: stat.isSymbolicLink()
			? $path.resolve($path.dirname(stat.path), fs.readlinkSync(stat.path))
			: false,
		file: stat.isFile(),
		directory: stat.isDirectory(),
		size: stat.size,
		accessed: stat.atime,
		modified: stat.mtime,
		changed: stat.ctime,
		created: stat.birthtime
	};
}
module.exports = (path, indiscriminateOfSymlinks) => new Promise((resolveStat, rejectStat) => {
			fs[indiscriminateOfSymlinks ? 'stat' : 'lstat'](path, (err, stats) => err
				? rejectStat(err)
				: resolveStat(Object.assign(stats, { path: path })));
		})

		// normalize the shit out of that mess
		.then(createExportForStat);

module.exports.sync =  (path, indiscriminateOfSymlinks) => createExportForStat(
	Object.assign(fs[indiscriminateOfSymlinks
		? 'statSync'
		: 'lstatSync'](path),
		{ path: path })
	);