const cp = require('child_process');
const command = 'docker stats --no-stream=true a74a9df3bc96';


function getRawStats() {
    return new Promise((resolve, reject) => {
      //executes the command line
      cp.exec(command, { encoding : 'utf8' }, (err, stdout, stderr) => {
        if(err) {
          err.message += ` "${command}" (exited with error code ${err.code})`;
          err.stderr = stderr;
          return reject(err);
        }
        else if (stderr) return reject(new Error(stderr));
        resolve(stdout);
      });
    })
    .then(stats => stats)
    .catch(err => { error: err.stack });
}


function parseStats(stats) {
	// convert to useful array
	var split = stats.split('  ');
	split = split.map(ind => ind.replace(/ /g, '')).filter(ind => ind.length);

	// set a few variables to optimize
	const length = split.length;
	const mem = split[length-5];
	const net = split[length-3];
	const block = split[length-2];

	return {
		cpuPercentUsage: split[length-6],
		memUsage: mem.split('/')[0],
		memLimit: mem.split('/')[1],
		memPercentUsage: split[length-4],
		netInput: net.split('/')[0],
		netOutput: net.split('/')[1],
		blockInput: block.split('/')[0],
		blockOutput: block.split('/')[1]
	};
}


function reportRedisContainerStats(command) {
	return getRawStats(command)
	.then(parseStats)
	.catch(err => console.log(err));
}


function setCron(logger) {
	const CronJob = require('cron').CronJob;
	new CronJob('0-59/10 * * * * *', function() {

	  	reportRedisContainerStats(command)
		.then(parsedStats => {

			const memPercentUsage = Number(parsedStats.memPercentUsage.slice(0,-1));
			var method;

			if (memPercentUsage < 50) method = 'info';
			else if (memPercentUsage < 80) method = 'warn';
			else method = 'error';

			logger[method]('Redis container stats', JSON.stringify(parsedStats));
		});

	}, null, true, 'America/New_York');
}


module.exports = {
	setCron
};


