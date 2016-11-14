'use strict';

const AskNicely = require('ask-nicely');

const Table = require('../classes/Table');
const getResults = require('../primitives/getResults');
const runPromisesInParallel = require('../primitives/runPromisesInParallel');
const executeInDir = require('../primitives/executeInDir');

// Create a table option, which allows us to automatically register the column and sorting options
const table = new Table([
	{
		name: 'name',
		default: true,
		label: 'Name',
		value: code => code.name
	},
	{
		name: 'path',
		label: 'Path',
		value: code => code.path
	},
	{
		name: 'branch',
		label: 'Branch',
		default: true,
		value: code => code.getBranchName()
	},
	{
		name: 'tag',
		label: 'Tag',
		value: code => code.getVersionStatus().then(versionStatus => versionStatus.tag
			? versionStatus.tag + (versionStatus.ahead ? ` (+${versionStatus.ahead})` : '')
			: '')
	},
	{
		name: 'status',
		label: 'Status',
		default: true,
		value: code => code.isDirty().then(isDirty => isDirty ? 'dirty' : 'clean')
	},
	{
		name: 'origin',
		label: 'Origin URL',
		value: code => code.getRemoteUrl().catch(() => null)
	}
]);

module.exports = app => {
	// Always start with some marketing h4x0r thoughtleadership
	app.commands
		.addPreController((req, res) => {
			res.caption('knoftobor');
		});

	// Build up a scope for which to repeat knoftobor actions
	// - adds a "scope" property to the request object
	app.commands
		.addParameter('alias')
		.addOption(new AskNicely.MultiOption('filters').setShort('f'))
		.addPreController((req, res) => {
			let destroyer = res.spinner('Finding repositories');

			return getResults(app, req.options.filters)
				.catch (err => {
					destroyer();
					throw err;
				})
				.then(results => {
					destroyer();

					return req.parameters.alias
						? results.filter(code => code.matchesAlias(req.parameters.alias))
						: results;
				})
				.then(results => {
					if(!results.length)
						throw new Error(`No results!`);

					req.scope = results;
				});
		});

	// Allow it to be overridden
	app.commands
		.addOption('terminal-width', null, 'Set the terminal width, leave empty for automatic')
		.addPreController((req, res) => {
			if(req.options['terminal-width'])
				this.logger.setWrapping(req.options['terminal-width']);
		});

	// Either list all results in req.scope, or repeat a command if the "exec" option is used
	app.commands
		.addOption(table.sortOption)
		.addOption(table.columnsOption)
		.addOption(table.exportOption)
		.addOption(new AskNicely.MultiOption('exec')
			.setDescription('A shell command to perform in each queried repository.')
			.setShort('$')
			.isInfinite(true)
		)
		.addOption(new AskNicely.Option('parallel')
			.setDescription('The number of parallel processes to spawn, defaults to 25.')
			.setShort('p')
			.setDefault(25, true)
		)
		.setController((req, res) => {
			// If a shell command was given, execute for all results
			if (req.options.exec.length) {
				res.debug(`Executing "${req.options.exec.join(' ')}"`);

				return runPromisesInParallel(req.scope.map(code => () => executeInDir(code.path, req.options.exec, res)
						.catch(err => { /* no-op */ })), req.options.parallel);
			}

			// If no shell command was given, list or export results table
			let destroyer = res.spinner('Getting column data');
			return table.prepare(res, req.options.columns, req.scope, req.options.sort, req.options.export)
				.catch (err => {
					destroyer();
					throw err;
				})
				.then(print => {
					destroyer();
					res.break();
					print();
				});
		});
};
