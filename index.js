// make a web server to keep the bot online
const express = require('express');
const app = express();
const port = 3000;
app.get('/', (req, res) => res.send('What are you looking for?'));
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

// replit database
const Database = require("@replit/database");
const db = new Database();

const { Permissions } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

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
  // updates VC using message id from database
  function updateVC() {
    db.list().then(async keys => {
      db.get('id').then(async valueID => {
        if (valueID == null) return;
        let msgRef = await msg.channel.messages.fetch(valueID);
        db.get('maxVC').then(async valueVC => {
          if (valueVC == null) return;
          let temp = 0;
          for (let i=keys.length-1; i>-1; i--) {
            if (keys[i] == 'id' || keys[i] == 'maxVC') {
              temp++;
            }
          }
          await new Promise(r => setTimeout(r, 500));
          msgRef.edit('**' + (keys.length-temp) + '/' + valueVC + '**');
        });
      });
    });
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
    // if !help alliance then alliance help
    if(args[0] === 'voting') {
      msg.channel.send("Use without arguments to show all votes. Use a username to show only that player's vote.");
    } else if (args[0] === 'vote') {
      msg.channel.send('Casts a vote for the person specified. Leave blank to see who you are currently voting for.');
    } else {
      msg.channel.send('!help\n!ping\n!spreadsheet\n!say\n!vote\n!voting\n!dvote\n!dvotes\n!setvote\n!createvc\n!deletevc');
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

  // stores a vote in the database tied to username
  if (command === 'vote') {
    if (msg.member.roles.cache.some(role => role.name === 'Alive') || checkForAdmin()) {
      if (args[0] === undefined) {
        db.get(msg.author.username).then(value => {msg.channel.send('Currently voting for '+value);});
        return;
      }
      try {
        let vote = args.join(" ");
        if(filterEveryone(vote) === true) {
          db.set(msg.author.username, vote);
          msg.channel.send('Vote accepted.');
          updateVC();
        } else throw filterEveryone(vote);
      } catch(err) {
        msg.channel.send('Something went wrong. Error: '+err);
      }
    } else {
      msg.channel.send('No permission!');
    }
  }

  // same as !vote but used by admins to manually set votes for other players
  if (command === 'setvote' && checkForAdmin()) {
    if (args[0] === undefined) {
      msg.channel.send("Invalid username");
      return;
    }
    try {
      let vote = args.join(" ").slice(args[0].length+1);
      if(filterEveryone(vote) === true) {
        db.set(args[0], vote);
        msg.channel.send('Vote accepted.');
        updateVC();
      } else throw filterEveryone(vote);
    } catch(err) {
      msg.channel.send('Something went wrong. Error: '+err);
    }
  }

  // removes a vote from selected player
  if (command === 'dvote' && checkForAdmin()) {
    try {
      db.list().then(keys => {
      let name = args.join(" ");
      for(let i=0;i<keys.length;i++) {
        if(name == keys[i]) {
          db.delete(name);
          msg.channel.send('Vote deleted.');
          updateVC();
          return;
        } 
      }
      throw 'Invalid username';
      });
    } catch(err) {
      msg.channel.send('Something went wrong. Error: '+err);
    }
  }
  
  // gets all votes/selected player's vote
  if (command === 'voting') {
    if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || msg.channel.id == 694422951092813824) {
      db.list().then(keys => {
        if (keys == '') {
          msg.channel.send('No votes found.');
          return;
        }});
      if (args[0] != undefined) {
        db.get(args[0]).then(value => {msg.channel.send(args[0]+': '+value)});
      } else {
        db.list().then(keys => {
        let allVotes = '';
        for (let i=0; i<keys.length; i++) {
          db.get(keys[i]).then(async value => {
          if (keys[i] != 'id' && keys[i] != 'maxVC') {
            allVotes = allVotes+keys[i]+': '+value+'\n';
          }
          if(i===keys.length-1) {
            await new Promise(r => setTimeout(r, 200));
            msg.channel.send(allVotes);
          }
          });
        }
        });
      }
    } else {
      msg.channel.send('No permission!');
    }
  }

  // deletes all votes and VC
  if (command === 'dvotes' && checkForAdmin()) {
    db.list().then(keys => {
    for (let i=keys.length-1; i>-1; i--) {
      db.delete(keys[i]);
    }
    msg.channel.send('All votes and VC deleted.');
    });
  }

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
}
);

client.login(process.env.TOKEN);

// do a funny dm to someone: client.users.fetch('ID GOES HERE').then((user) => {user.send("funny");});
// do a funny message to a channel: client.channels.cache.get('CHANNEL ID').send('funny');