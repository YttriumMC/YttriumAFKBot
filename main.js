var mineflayer = require('mineflayer');

var options = {
    host: process.argv[2],
    username: process.argv[3],
};


var bot = mineflayer.createBot(options);  
console.log("----MercuryMC AFK bot Starting----")
bindEvents(bot);

function bindEvents(bot) {
  bot.on('login', function() {
    console.log("I logged in.");
    console.log("settings", options);
  });
    bot.on('error', function(err) {
        console.log('Error attempting to reconnect: ' + err.errno + '.');
        if (err.code == undefined) {
            console.log('Invalid credentials OR bot needs to wait because it relogged too quickly.');
            console.log('Will retry to connect in 10 seconds. ');
            setTimeout(relog, 10000);
        }
    });

    bot.on('end', function() {
        console.log("Bot has ended, trying to reconnect in 10 seconds");
        // If set less than 30s you will get an invalid credentials error, which we handle above.
        setTimeout(relog, 10000);  
    });
}

function relog() {
    console.log("Attempting to reconnect...");
    bot = mineflayer.createBot(options);
    bindEvents(bot);
}

