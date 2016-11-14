'use strict';
const path = require('path');
const AskNicely = require('ask-nicely');

const NO_DESCRIPTION = '<no description>';

function sortByName(a, b) {
	return a.name < b.name ? -1 : 1;
}
function toCommandRow (cmd) {
	return [
		cmd.name,
		cmd.description || NO_DESCRIPTION
	];
}
function toParameterRow (param) {
	return [
		`<${param.name}>`,
		param.description || NO_DESCRIPTION,
		param.required ? ' * ' : '   '
	];
}
function toOptionRow (option) {
	return [
		option.short ? `-${option.short}  ` : `    `,
		`--${option.name}`,
		option.description || NO_DESCRIPTION,
		option.required ? ' * ' : '   '
	];
}


module.exports = app => {
	const packageJson = require(path.resolve(__dirname, '..', 'package.json'));

	app.commands.setDescription(packageJson.description);

	function helpController (req, res) {
		res.caption('How to knoftobor');

		return helpCommandController.apply(this, arguments);
	}
	function helpCommandController(req, res) {
		var command = req.command,
			isRoot = !command.parent;

		if(isRoot) {
			res.log(`Knoftobor is a tool meant to install, maintain, update and batch-process git repositories in a specific framework, ie. FontoXML.`);
			res.break();
			res.log(`Its other goal is to provide an easy-to-understand but powerful means to running code from *other* tools: ie fontoxml-gulp, fotno or fpm.`);
			res.break();
			res.properties({
				'Knoftobor': `${path.resolve(__dirname, '..')} (v${packageJson.version})`,
				'Framework path': app.cwd(),
				'Framework config': app.config.getPath(),
				'Process path': process.cwd()
			});
		} else {
			res.log(`Command usage info for "${command.name}"`);
			res.break();
			res.properties({
				'Description': command.description || NO_DESCRIPTION
			});
		}

		if(command.children.length) {
			res.caption('Child commands');
			res.properties(command.children.sort(sortByName).map(toCommandRow));
		}

		if(command.parameters.length) {
			res.caption('Parameters');
			res.table(
				['Name', 'Description', 'Req'],
				command.parameters.map(toParameterRow),
				false
			);
		}

		var options = command.options;
		if(options.length) {
			res.caption('Options');
			res.table(
				['Shrt', 'Long', 'Description', 'Req'],
				options.sort(sortByName).map(toOptionRow),
				false
			);
		}

		res.caption('Filter');

		res.log(`You can specify filters by using the -f flag, and then the filters you want to apply seperated with spaces. Options to a filter are specified by seperating them from the filter name with a semicolon (":"). The effect of a filter can be inversed by prepending the filtername with a tilde ("~")`);
		res.break();
		res.properties(app.filters.sort((a, b) => a.name.localeCompare(b.name)).map(filter => [filter.name, filter.description]));
	}

	app.commands.addOption(new AskNicely.IsolatedOption('help')
		.setShort('h')
		.setDescription('Show usage information for this command'))
		.addPreController((req, res) => {
			if(!req.options.help)
				return;

			helpController.call(this, req, res);

			return false;
		});

	app.commands
		.addCommand('test', (req, res) => {
			console.log(require('util').inspect(app, {depth: 2, colors: true}));
		})
};
