'use strict';

const AskNicely = require('ask-nicely');
const path = require('path');
const fs = require('fs');
const os = require('os');

const runPromisesInParallel = require('../primitives/runPromisesInParallel');

function xlsExport(tableData) {
	return [tableData.columns.map(col => col.label)]
			.concat(tableData.rows)
			.map(row => row.join('\t'))
			.join(os.EOL)
		+ os.EOL;
}

function csvExport(tableData) {
	return [tableData.columns.map(col => col.label)]
			.concat(tableData.rows)
			.map(row => row.map(cell => `"${cell}"`).join(','))
			.join(os.EOL)
		+ '\r\n'; // Use \r\n rather than os.EOL as per RFC 4180
}

function jsonExport (tableData) {
	return JSON.stringify(tableData.rows.map(row => tableData.columns.reduce((obj, col, i) => {
			obj[col.name] = row[i];
			return obj;
		}, {})), null, '\t')
		+ os.EOL;
}

const exportTransformers = {
	csv: csvExport,
	xls: xlsExport,
	json: jsonExport
};

class Table {
	constructor (columns) {
		this.columns = columns;

		this.sortOption = new AskNicely.Option('sort')
			.setShort('s')
			.setDescription('Column name or number to sort by (defaults to 0, first column)')
			.setDefault(0, true);

		this.columnsOption = new AskNicely.MultiOption('columns')
			.setDescription('One or more space-separated column names to print (' + columns.map(col => col.name + (col.default ? '*' : '')).join('|')+ '), only works when not exporting.')
			.setShort('c')
			.setDefault(columns.filter(col => col.default).map(col => col.name), true);

		this.exportOption = new AskNicely.Option('export')
			.setDescription('Export table to a file; the export type is determined by the file extension (' +Object.keys(exportTransformers).map((col, i) => col + (!i ? '*' : '')).join('|')+')')
			.setShort('e');
	}

	prepare (res, columnsInput, data, sortInput, exportLocation) {
		const visibleColumnDefinitions = exportLocation
				? this.columns
				: getColumnDefinitionsForInput(columnsInput, this.columns);

		return getData(visibleColumnDefinitions, data, getSortIndexForInput(sortInput, visibleColumnDefinitions))
			.then(tableData => () => printData(res, visibleColumnDefinitions, tableData, exportLocation));
	}

}

function getSortIndexForInput (sortColumnIndex, visibleColumnDefinitions) {
	return isNaN(parseInt(sortColumnIndex))
		? Math.max(visibleColumnDefinitions.findIndex(column => column.name === sortColumnIndex), 0)
		: parseInt(sortColumnIndex);
}

function getColumnDefinitionsForInput (columns, allColumns) {
	return columns
		.map(columnName => allColumns.find(column => column.name === columnName))
		.filter(column => !!column)
}

function printData (res, visibleColumnDefinitions, tableData, exportLocation) {
	if(!exportLocation) {
		res.table(tableData.columns.map(col => col.label + (col.isSorted ? '*' : '')), tableData.rows.map(row => row.map(cell => cell || '-')));

		res.break();
		res.success(`Printed ${visibleColumnDefinitions.map((col, i) => col.label + (col.isSorted ? '*' : '')).join(', ').toLowerCase()} for ${tableData.rows.length} results`);

		return;
	}

	let ext = path.extname(path.basename(exportLocation)).replace('.', '');

	if(!exportTransformers[ext])
		throw new AskNicely.InputError(`Unknown export type "${ext}"`, `You can export a table by using the "export" option to specify a file with one of the following extensions: ${Object.keys(exportTransformers).join('|')}`);

	res.debug(`Exporting to "${exportLocation}"`);
	var exported = exportTransformers[ext](tableData);

	// Notice this favours process.cwd() over app.processPath, which is not necessarily the same
	fs.writeFileSync(exportLocation, exported);

	res.debug('Exported file: ' + exported.length + ' characters');
}

function getData (visibleColumnDefinitions, data, sortIndex) {
	return runPromisesInParallel(data.map(operation => {
			return () => Promise.all(visibleColumnDefinitions.map(column => column.value(operation)));
		}), 10)
		.then(rowData => ({
			columns: visibleColumnDefinitions.map((column, i) => Object.assign(column, { isSorted: i === sortIndex })),
			rows: rowData.sort((a,b) => a[sortIndex] === b[sortIndex] ? 0 : (a[sortIndex] < b[sortIndex] ? -1 : 1))
		}));
}

module.exports = Table;
