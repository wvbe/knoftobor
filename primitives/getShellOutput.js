'use strict';

const fs = require('fs');
const path = require('path');

const spawn = require('cross-spawn-async');

module.exports = (cwd, argv) => {
	let lines = [];

	return new Promise((resolve, reject) => {

		const spawnedProcess = spawn(argv[0], argv.slice(1), { cwd: cwd });

		spawnedProcess.stdout && spawnedProcess.stdout.on('data', (data) => {
			data = data.toString().trim();
			if(!data)
				return;
			lines = lines.concat(data.split('\n'));
		});

		spawnedProcess.on('error', err => reject(err));

		spawnedProcess.on('close', () => resolve(lines));
	});
};
