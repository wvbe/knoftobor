class FilterManager extends Array {
	constructor () {
		super();
	}

	addFilter (name, callback, description) {
		this.push({
			name,
			callback,
			description
		});
	}
}

module.exports = FilterManager;
