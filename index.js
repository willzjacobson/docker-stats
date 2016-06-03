const chalk = require('chalk');


function Logger() {
	this.info = function(val1, val2) {
		console.log(chalk.green(val1, val2));
	};
	// this.info = (val1, val2) => console.log(chalk.green(val1, val2));
	this.warn = (val1, val2) => console.log(chalk.yellow(val1, val2));
	this.error = (val1, val2) => console.log(chalk.red(val1, val2));
}
const logger = new Logger();


require('./redis-check').setCron(logger);
