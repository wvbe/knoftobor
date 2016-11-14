'use strict';

// core node modules
const path = require('path');

// 3rd party node modules
const glob = require('globby');
const AskNicely = require('ask-nicely');
const SpeakSoftly = require('speak-softly');



// classes, helpers
const RepositoryManager = require('./RepositoryManager');
const FilterManager = require('./FilterManager');
const ConfigManager = require('./ConfigManager');

class Knoftobor {
	constructor (name) {
		this.name = name;

		this.repositories = new RepositoryManager();

		this.filters = new FilterManager();

		this.config = new ConfigManager(name);

		this.commands = new AskNicely(this.name);

		this.logger = new SpeakSoftly(this.config.colors || {}, {
			indentation: '  '
		});

		glob.sync(['../modules/*.js', '../filters/*.js'], { cwd: __dirname })
			.reduce((modules, modulePath) => {
				let mod = require(path.resolve(__dirname, modulePath));

				if(typeof mod !== 'function')
					throw new Error('Module is not a function');

				modules.push(mod);
				return modules;
			}, [])
			.forEach(module => module(this));
	}

	cwd() {
		return path.dirname(this.config.getPath());
	}

	run (argv) {
		return (this.cwd()
				? this.commands.interpret(Object.assign([], argv), null, this.logger)
				: Promise.reject(new AskNicely.InputError(
					`Couldn't find the ${this.name} configuration file`,
					`Create a a file called "${this.config.getFileName()}" in ${process.cwd()} or one of its ancestors`
				))
			)
			.then(request => request.execute(this.logger))

			.catch(err => this.error('knoftofail', err, {
				argv: [this.name].concat(argv.map(arg => arg.indexOf(' ') >= 0 ? `"${arg}"` : arg)).join(' '),
				cwd: process.cwd(),
				fwd: this.cwd()
			}))

			.then(() => {
				this.logger.break();
				return this;
			});
	}

	error (caption, err, debugVariables) {
		if(caption)
			this.logger.caption(caption);

		if(err)
			this.logger.error(err.message || err.stack || err);
		else
			console.trace('Empty error');

		if (err instanceof AskNicely.InputError)
			this.logger.log(err.solution || 'You might be able to fix this, use the "--help" flag for usage info');
		else {
			this.logger.debug(err.stack);

			if (debugVariables)
				this.logger.properties(debugVariables);
		}
	}
}

module.exports = Knoftobor;
