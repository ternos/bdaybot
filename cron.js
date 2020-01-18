var CronJob = require('cron').CronJob;
new CronJob('* * * * * *', function() {
    const d = new Date();
	console.log('Every Tenth Minute:', d);
}, null, true, 'Europe/Moscow');