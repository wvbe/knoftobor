'use strict';

const fs = require('fs');
const path = require('path');
const globby = require('globby');

const runPromisesInParallel = require('./runPromisesInParallel');
const Code = require('../classes/Code');

const FILTER_SPLIT_CHAR = ':';
const NEGATION_CHARACTER = '~';

function getFilterForName (app, filterName) {
	let filter = [isGitControlledFilter].concat(app.filters)
		.find(filter => filter.name === filterName);

	if(!filter)
		throw new Error(`Filter "${filterName}" does not exist`);

	return filter.callback;
}

var isGitControlledFilter = {
	name: 'is-git-controlled',
	description: 'This filter is always on and therefore hard-coded',
	callback: function filterIsGitControlled (targetPath) {
		return new Promise(res => fs.stat(path.resolve(targetPath, '.git'), (err) => res(!err)));
	}
};

function applyFilters (app, list, filterInput) {
	const filterOptions = filterInput.split(FILTER_SPLIT_CHAR),
		filterName = filterOptions.splice(0, 1)[0],
		isNegation = filterName.charAt(0) === NEGATION_CHARACTER,
		filter = getFilterForName(app, isNegation ? filterName.substr(1) : filterName);

	const results = [];

	return runPromisesInParallel(list.map(code => () => {
			try {
				return filter.apply(undefined, [code.path].concat(filterOptions))
					.then(isMatchForFilter => !!isMatchForFilter === !isNegation && results.push(code))
					.catch(err => {
						// console.log(err.stack);
					});
			} catch (err) {
				// console.log(err.stack);
			}
		}), 10)
		.then(() => results);
}

function getGitControlledDirectoriesInRoots (frameworkPath, patterns) {
	return globby(patterns, { cwd: frameworkPath })
			.then(results => results.map(result => result.substr(0, result.length - 1)));
}

module.exports = function getResults(app, filterStrings) {
	return getGitControlledDirectoriesInRoots(app.cwd(), app.config.roots)
		.then(results => {
			return results;
		})
		.then(results => results.map(result => {
			if(!app.repositories[result])
				app.repositories[result] = new Code(path.resolve(app.cwd(), result), result);

			return app.repositories[result];
		}))
		.then(results => ['is-git-controlled'].concat(filterStrings)
			.reduce((promisedResults, filterString) => {
				return promisedResults.then(results => applyFilters(app, results, filterString));
			}, Promise.resolve(results))
		);
};
