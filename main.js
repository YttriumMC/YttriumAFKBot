var mineflayer = require('mineflayer');

var options = {
    host: process.argv[2],
    port: process.argv[3],
    username: process.argv[4],
};

var BotEnabled = true;
var recheckTimeout
var IsRestarting = false;
var WebPort = process.argv[5] ? process.argv[5] : 4141;

var bot = mineflayer.createBot(options);  
var ChatLog = "";
console.log("----MercuryMC AFK bot Starting----")
bindEvents(bot);

function bindEvents(bot) {
  bot.on('login', function() {
    console.log("I logged in.");
    console.log("settings", options);
  });
  
  bot.on('message', (message) => {
    console.log("CHAT: " + message.toAnsi())
    ChatLog = ChatLog + "\n" + message;
    
  })
    bot.on('error', function(err) {
        console.log('Error attempting to reconnect: ' + err.errno + '.');
        if (err.code == undefined) {
            console.log('Invalid credentials OR bot needs to wait because it relogged too quickly.');
            console.log('Will retry to connect in 10 seconds. ');
            if (!IsRestarting) {
            setTimeout(relog, 10000);
            IsRestarting = true;
            }
        }
    });

    bot.on('end', BotEndedCheck);
}

function BotEndedCheck() {
  clearTimeout(recheckTimeout)
  if (BotEnabled == true) {  
  console.log("Bot has ended, trying to reconnect in 10 seconds");
    // If set less than 30s you will get an invalid credentials error, which we handle above.
    if (!IsRestarting) {
      setTimeout(relog, 10000);
      IsRestarting = true;
    }
  }
  else {
    console.log("Bot is disabled. You can enable it again in Web UI")
    recheckTimeout = setTimeout(BotEndedCheck, 5000)
  }  
}

function relog() {
    if(BotEnabled == true) { 
    console.log("Attempting to reconnect...");
    bot = mineflayer.createBot(options);
    bindEvents(bot);
    IsRestarting = false
    }
    if (BotEnabled == false) {
      console.log('Bot is disabled. You can enable it again in Web UI.')
      IsRestarting = false
    }
}




// Docker Ctrl+C fix
var dockerprocess = require('process')
dockerprocess.on('SIGINT', () => {
  console.info("Stopping")
  dockerprocess.exit(0)
})

// Express (needed for WebUI to work) initialization
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/webServer/index.html');
});

app.get('/Username', (req, res) => {
  res.send(options.username);
});

app.get('/HostIP', (req, res) => {
  res.send(options.host);
});
app.get('/BotStatus', (req, res) => {
  res.send(BotEnabled);
});
app.get('/ChatLog', (req, res) => {
  res.send(ChatLog);
});

io.on('connection', (socket) => {
  console.log('WebUI connected');
  
  socket.on('disconnect', () => {
    console.log('WebUI disconnected');
  });

  socket.on('StartButtonClicked', () => {
    console.log('Start button clicked, enabling bot');
    BotEnabled = true;
  });

  socket.on('StopButtonClicked', () => {
    console.log('Stop button clicked, disabling bot');
    BotEnabled = false;
  });
  socket.on('ChangeUsernameButtonClicked', (NewUsername) => {
    console.log('Change Username button clicked, changing bot username to ' + NewUsername);
    options.username = NewUsername;
  });
  socket.on('ChangeHostIpButtonClicked', (NewHostIP) => {
    console.log('Change server ip button clicked, changing server ip to ' + NewHostIP);
    options.host = NewHostIP;
  });
  socket.on('ChangeHostPortButtonClicked', (NewHostPort) => {
    console.log('Change server port button clicked, changing server port to ' + NewHostPort);
    options.port = NewHostPort;
  });

  setInterval(function() {
  io.emit('HostIP', options.host + ':' + options.port);
  io.emit('Username', options.username);
  io.emit('BotStatus', BotEnabled);
  },1000)
});

server.listen(WebPort, () => {
  console.log('listening on *:' + WebPort);
});


