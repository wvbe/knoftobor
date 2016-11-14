'use strict';

let fs = require('fs'),
	$path = require('path') /* renamed to avoid collisions */,

	getStatForPath = require('./getStatForPath');

/**
 * Executes a readdir() and then stat/lstat for it's children.
 * @param {String} dir - existing directory or symlink to one
 * @param indiscriminateOfSymlinks - pretend symbolic links are just files or directories
 * @returns {*}
 */
module.exports = (dir, indiscriminateOfSymlinks) => new Promise((resolve, reject) => {
		fs.readdir(dir, (err, files) => err
			? reject(err)
			: resolve(files.map(file => $path.resolve(dir, file))));
		})

		// lstat (or stat) the paths
		.then(paths => Promise.all(paths.map(path => getStatForPath(path, indiscriminateOfSymlinks))));

module.exports.sync = (dir, indiscriminateOfSymlinks) => fs.readdirSync(dir)
		.map(file => $path.resolve(dir, file))
		.map(path => {
			try {
				return getStatForPath.sync(path, indiscriminateOfSymlinks);
			} catch (err) {
				return false;
			}
		})
		.filter(stat => !!stat);
