const fs = require('fs');
const { Permissions } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"]})
const fileName = './votes.json';
const votes = require(fileName);
require('dotenv').config({path:"C:/Users/yoshi/Desktop/chadwick's junk/bot/auth.env"});
console.log(require("dotenv").config());
console.log(process.env.TOKEN+'test');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('debug', console.log);

// actual bot code
client.on('messageCreate', async msg => {
  // filters a message for an empty string, @everyone, and @here
  // returns true on success, returns an error on failure
  function filterEveryone(text) {
    try {
      if (text === '') throw 'Empty string';
      if (!(text.search(/@everyone/)===-1)) throw 'Mentions everyone';
      if (!(text.search(/@here/)===-1)) throw 'Mentions here';
    } catch(err) {
      return err;
    }
    return true;
  }
  
  function checkForAdmin() {
    // tests for permission to use command
    if (!(msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))) {
      msg.channel.send('No permission!');
      return false;
    }
    return true;
  }
  
  function assign(obj, prop, value) {
	if (typeof prop === "string")
	  prop = prop.split(".");
	if (prop.length > 1) {
	  var e = prop.shift();
	  assign(obj[e] =
        Object.prototype.toString.call(obj[e]) === "[object Object]"
        ? obj[e]
        : {},
        prop,
        value);
	} else
	  obj[prop[0]] = value;
  }
  
  // makes ! a prefix and doesn't look at messages without it
  const prefixes = ["!"];
  const prefix = prefixes.find(p => msg.content.startsWith(p));

  // don't reply to yourself silly
  if (msg.author.bot) return;
  if (!prefix) return;
  // splits apart arguments and command
  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // sends a list of all commands
  if (command === 'help') {
    if(args[0] === 'voting') {
      msg.channel.send("Use without arguments to show all votes. Use a username to show only that player's vote.");
    } else if (args[0] === 'vote') {
      msg.channel.send('Casts a vote for the person specified. Leave blank to clear your vote.');
    } else {
      msg.channel.send('!help\n!ping\n!spreadsheet\n!say\n!vote\n!voting\n!dvote\n!dvotes\n!setvote\n!createvc (deprecated)\n!deletevc (deprecated)');
    }
  }

  // simple ping command
  if (command === 'ping') {
    msg.channel.send(`Pong! ${client.ws.ping}ms.`);
  }

  // You are stupid!
  if (command === 'advantage') {
    msg.channel.send(`You are stupid!`);
  }
  
  if (command === 'stop') {
	if (msg.author.id != 644235790901182494 && msg.author.id != 640026747051573250) {
      msg.channel.send('No permission!');
    } else {
	  process.exit();
	}
  }

  // stores a vote in votes.json tied to username
  if (command === 'vote') {
    if (msg.member.roles.cache.some(role => role.name === 'Alive') || checkForAdmin()) {
      if (args[0] == undefined) {
		assign(votes, msg.author.username, '');
	    msg.channel.send('Vote deleted.');
	  }
	  assign(votes, msg.author.username, args[0]);
	  fs.writeFile(fileName, JSON.stringify(votes), function writeJSON(err) {
        if (err) return console.log(err);
        msg.channel.send('Vote accepted.');
        console.log('writing to ' + fileName);
	  });
    } else {
      msg.channel.send('No permission!');
    }
  }


  // same as !vote but used by admins to manually set votes for other players
  if (command === 'setvote' && checkForAdmin()) {
    if (args[0] === undefined) {
      msg.channel.send("Invalid username.");
      return;
    }
    assign(votes, args[0], args[1]);
	fs.writeFile(fileName, JSON.stringify(votes), function writeJSON(err) {
      if (err) return console.log(err);
      msg.channel.send('Vote accepted.');
      console.log('writing to ' + fileName);
	});
  }


  // removes a vote from selected player
  if (command === 'dvote' && checkForAdmin()) {
    assign(votes, args[0], ' ');
	fs.writeFile(fileName, JSON.stringify(votes), function writeJSON(err) {
      if (err) return console.log(err);
      msg.channel.send('Vote deleted.');
      console.log('writing to ' + fileName);
	});
  }
 
  // gets all votes/selected player's vote

  if (command === 'voting') {
    if (checkForAdmin() || msg.channel.id == 694422951092813824) {
	  let allVotes = '';
      Object.entries(votes).forEach(([key, value]) =>
	    allVotes += key+': '+value+'\n'
	  );
	  msg.channel.send(allVotes);
    } else {
      msg.channel.send('No permission!');
    }
  }

  // deletes all votes and VC
  if (command === 'dvotes' && checkForAdmin()) {
    Object.entries(votes).forEach(([key, value]) =>
	  assign(votes, key, ' ')
	);
	fs.writeFile(fileName, JSON.stringify(votes), function writeJSON(err) {
      if (err) return console.log(err);
      msg.channel.send('All votes and VC deleted.');
      console.log('writing to ' + fileName);
	});
  }
/*
  if ((command === 'deletevc' || command === 'dvc') && checkForAdmin()) {
    db.list().then(keys => {
    for (let i=keys.length-1; i>-1; i--) {
      if (keys[i] == 'id' || keys[i] == 'maxVC') {
        db.delete(keys[i]);
      }
    }
    msg.channel.send('VC deleted.');
    });
  }
  */
  // runs a command, only Cymbalic can use
  if (command === 'run') {
    if (msg.author.id != 644235790901182494 && msg.author.id != 640026747051573250) {
      msg.channel.send('No permission!');
    } else {
      eval('function func() { ' + args.join(" ") + '}');
      func();
      msg.channel.send('Command success!');
    }
  }

  // sends a link to the ranked spreadsheet
  if (command === 'spreadsheet' || command === 'sheet') {
    msg.channel.send('https://docs.google.com/spreadsheets/d/1Ne3NzkaSV1boKZZHuzbeKdkBCzj9j6Sfy9x7f6sX0v8/edit?usp=sharing');
  } 
  
  // repeats whatever comes next, does not allow empty strings, @everyone, nor @here
  if (command === "say") {
    try {
      let string = args.join(' ');
      if(filterEveryone(string) === true) {
        msg.channel.send(string);
      } else throw filterEveryone(string);
    } catch(err) {
      msg.channel.send('Something went wrong. Error: '+err);
    }
  }
/*
  // creates a vote count in specified channel out of specified amount using votes from database
  if ((command === "createvc" || command === 'cvc') && checkForAdmin()) {
    let chID = msg.guild.channels.cache.get(args[0].substring(2).substring(0,18));
    db.list().then(keys => {
      let temp = 0;
      for (let i=keys.length-1; i>-1; i--) {
        if (keys[i] == 'id' || keys[i] == 'maxVC') {
          temp++;
        }
      }
      let content = '**' + (keys.length-temp) + '/' + args[1] + '**';
      chID.send(content).then(sent => {
        let msgID = sent.id;
        db.set('id', msgID);
      });
      db.set('maxVC', args[1]);
    });
  }
*/
}
);

client.login(process.env.TOKEN);

// do a funny dm to someone: client.users.fetch('ID GOES HERE').then((user) => {user.send("funny");});
// do a funny message to a channel: client.channels.cache.get('CHANNEL ID').send('funny');