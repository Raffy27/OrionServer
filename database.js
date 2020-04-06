const
    fs = require('fs'),
    xml2js = require('xml2js'),
    crypto = require('crypto'),
    chalk = require('chalk');

const
    saver = new xml2js.Builder({
        renderOpts: {pretty: true, indent: '\t'}
    }),
    parser = new xml2js.Parser({
        explicitRoot: false,
        explicitArray: false
    }),
    builder = new xml2js.Builder({
        renderOpts: {pretty: true, indent: '\t'}
    });

var
  List = {
      bot: []
  };

  Users = {
      user: []
  };

  Blacklist = {
      bot: []
  }

  StartTime = Date.now();

exports.builder = builder;
exports.List = List;
exports.Stats = [];

exports.uptime = function(){
    return Date.now() - StartTime;
}

const
    error = chalk.redBright('ERROR'),
    warning = chalk.keyword('orange')('WARN'),
    info = chalk.cyan('INFO');

//--------------------- USER FUNCTIONS ----------------------

exports.loadUsers = function(){
    fs.readFile('Database\\Users.xml', function(e, data){
        if (e) throw e;
        parser.parseString(data, function(e, data){
            if (e) throw e;
            if(data){
                if(typeof data == 'object'){
                    if(data.user){
                        if(Array.isArray(data.user)){
                            Users.user = data.user;     //For multiple bots
                        } else {
                            Users.user.push(data.user); //For a single bot
                        }
                    }
                }
            } else {
                console.log(warning, 'Database "Users" invalid, using reasonable defaults.');
            }
            console.log(info, 'Loaded', Users.user.length, 'user(s).');
        });
    });
};

exports.addUser = function(user, pass, role){
    let newUser = {
        $: {
            id: Users.user.length + 1,
            user: user,
            pass: crypto.createHash('sha256').update(pass).digest('hex'),
            role: role,
            reg: Date.now().toString()
        }
    };
    Users.user.push(newUser);
    let tmp = saver.buildObject({'users': Users});
    try {
        fs.writeFileSync('Database\\Users.xml', tmp);
        console.log(info, 'User added.');
    } catch (e) {
        console.error(error, `Failed to add user:\n\t${e.message}`);
    }
};

exports.findUser = function(user, pass){
    for(var i = 0; i<Users.user.length; i++){
        if(Users.user[i].$.user == user){
            if(Users.user[i].$.pass == pass){
                return i;
            }
            break;
        }
    }
    return -1;
}

exports.login = function(user, pass, ret){
    let p = crypto.createHash('sha256').update(pass).digest('hex');
    let u = exports.findUser(user, p);
    if(u>-1){
        Users.user[u].$.last = Date.now().toString();
        ret.role = Users.user[u].$.role;
        return true;
    } else {
        return false;
    }
}

exports.getUserCount = function(){
    return Users.user.length;
}

//---------------------- BOT FUNCTIONS ----------------------

exports.loadBots = function(){
    fs.readFile('Database\\Bots.xml', function(e, data){
        if (e) throw e;
        parser.parseString(data, function(e, data){
            if (e) throw e;
            if(data){
                if(typeof data == 'object'){
                    if(data.bot){
                        if(Array.isArray(data.bot)){
                            List.bot = data.bot;     //For multiple bots
                        } else {
                            List.bot.push(data.bot); //For a single bot
                        }
                    }
                }
            } else {
                console.log(warning, 'Database "Bots" invalid, using reasonable defaults.');
            }
            console.log(info, 'Loaded', List.bot.length, 'bot(s).');
        });
    });
};

exports.loadBlacklist = function(){
    fs.readFile('Database\\Blacklist.xml', function(e, data){
        if (e) throw e;
        parser.parseString(data, function(e, data){
            if (e) throw e;
            if(data){
                if(typeof data == 'object'){
                    if(data.bot){
                        if(Array.isArray(data.bot)){
                            Blacklist.bot = data.bot;     //For multiple bots
                        } else {
                            Blacklist.bot.push(data.bot); //For a single bot
                        }
                    }
                }
            } else {
                console.log(warning, 'Database "Blacklist" invalid, using reasonable defaults.');
            }
            console.log(info, 'Loaded', Blacklist.bot.length, 'blacklist entries.');
        });
    });
};

exports.isBlacklisted = function(id){
    for(var i = 0; i<Blacklist.bot.length; i++){
        if(Blacklist.bot[i].id == id)
            return true;
    }
    return false;
}

exports.addToBlacklist = function(id){
    Blacklist.bot.push({
        id: id
    });
    exports.deleteBot(id);
}

exports.autoSave = function(){
    let tmp = saver.buildObject({'bots': List});
    let tmp2 = saver.buildObject({'users': Users});
    let tmp3 = saver.buildObject({'blacklist': Blacklist});
    try {
        fs.writeFileSync('Database\\Bots.xml', tmp);
        fs.writeFileSync('Database\\Users.xml', tmp2);
        fs.writeFileSync('Database\\Blacklist.xml', tmp3);
        console.log(info, 'Autosave completed.');
    } catch (e) {
        console.error(error, `Autosave failed: ${e.message}`);
    }
};

exports.addBot = function(newBot){
    List.bot.push(newBot);
};

exports.findBot = function(id){
    for(var v of List.bot){
        if(v.id == id) return v;
    }
    return null;
};

exports.deleteBot = function(id){
    for(var i = 0; i<List.bot.length; i++){
        if(List.bot[i].id == id){
            List.bot.splice(i, 1);
            return true;
        }
    }
    return false;
}

exports.updateLastSeen = function(id){
    let p = -1;
    for(var i = 0; i<List.bot.length; i++){
        if(List.bot[i].id == id){
            p = i;
            break;
        }
    }
    if(p>-1){
        List.bot[p].last = Date.now().toString();
    }
}

exports.printBots = function(){
    for(var v of List.bot){
        console.log(`${v.name} [${v.id}]`);
    }
}

exports.isBotOnline = function(v){
    return (Math.floor((Date.now() - v.last) / 6000) < 3);
}

exports.getOnlineBotCount = function(){
    var o = 0;
    for(var v of List.bot){
        o += exports.isBotOnline(v);
    }
    return o;
}

//---------------------- COMMAND FUNCTIONS ----------------------

exports.getNewCommandID = function(){
    return Date.now().toString();
};

exports.addCommand = function(bot, cmd, params, id){
    if(bot){
        let newCmd = {
            $: {
                id: id ? id : exports.getNewCommandID(),
                type: cmd
            }
        };
        for(var v in params) newCmd[v] = params[v];
        if(!bot.commands.cmd) bot.commands = {cmd:[]};
        if(!Array.isArray(bot.commands.cmd)) bot.commands = {cmd:[bot.commands.cmd]};
        bot.commands.cmd.push(newCmd);
        return true;
    }
    console.log(warning, 'Failed to add command', cmd);
    return false;
};

exports.removeCommand = function(bot, index){
    bot.commands.cmd.splice(index, 1);
};

exports.findCommandIndex = function(bot, id){
    for(var i = 0; i<bot.commands.cmd.length; i++){
        if(bot.commands.cmd[i].$.id==id){
            return i;
        }
    }
    return -1;
};

//---------------------- LOGGING FUNCTIONS ----------------------

exports.addLog = function(bot, id, text){
    if(!bot.log.p) bot.log = {p:[]};
    if(!Array.isArray(bot.log.p)) bot.log = {p:[bot.log.p]};
    if(bot.log.p.length>15) bot.log.p.shift();
    bot.log.p.push({
        $: {
            id: id
        },
        _: text
    });
};

exports.clearLog = function(bot){
    bot.log = {p:[]};
};
