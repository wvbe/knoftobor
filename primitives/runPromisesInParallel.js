'use strict';

function runPromisesInParallel (promiseRunners, maxParallelPromises) {
	if (promiseRunners.length === 0) {
		return Promise.resolve([]);
	}

	const results = [];
	const remaining = promiseRunners.slice().reverse();

	// TODO: refactor to a pure closure without a lexical scope dependency on results and remaining
	function startPromiseRunner (promiseRunner) {
		return Promise.resolve(promiseRunner())
			.then((result) => {
				results.push(result);

				const nextPromiseRunner = remaining.shift();
				if (nextPromiseRunner) {
					return startPromiseRunner(nextPromiseRunner);
				}
			});
	}

	maxParallelPromises = Math.min(maxParallelPromises || Infinity, promiseRunners.length);
	const runningPromises = [];
	for (let i = 0; i < maxParallelPromises; ++i) {
		runningPromises.push(startPromiseRunner(remaining.shift()));
	}
	return Promise.all(runningPromises).then(() => results);
}

module.exports = runPromisesInParallel;
