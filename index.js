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
  // makes ! a prefix and doesn't look at messages without it
  const prefixes = ["!"];
  const prefix = prefixes.find(p => msg.content.startsWith(p));
  // reacts to messages containing fruit with fruit
  if (!(msg.content.search(/pear/i)===-1) || !(msg.content.search(/🍐/i)===-1) || !(msg.content.search(/par/i)===-1)) {
    msg.react("🍐");
  } 
  if (!(msg.content.search(/🍌/i)===-1) || !(msg.content.search(/bnn/i)===-1) || !(msg.content.search(/ana/i)===-1)) {
    msg.react("🍌");
  } 
  if (!(msg.content.search(/ngo/i)===-1) || !(msg.content.search(/🥭/i)===-1)) {
    msg.react("🥭");
  } 
  if ((msg.content.search(/ang/i) < msg.content.search(/mang/i)) || msg.content.search(/mang/i)===-1 && !(msg.content.search(/ang/i)===-1) || !(msg.content.search(/🍊/i)===-1) || !(msg.content.search(/ ang/i)===-1)) {
    msg.react("🍊");
  } 
  if (!(msg.content.search(/oco/i)===-1) || !(msg.content.search(/🥥/i)===-1)) {
    msg.react("🥥");
  } 
  if (!(msg.content.search(/herry/i)===-1) || !(msg.content.search(/erri/i)===-1) || !(msg.content.search(/🍒/i)===-1) || !(msg.content.search(/eri/i)===-1)) {
    msg.react("🍒");
  } 
  if ((msg.content.search(/apple/i) < msg.content.search(/pineapple/i)) || msg.content.search(/eapple/i)===-1 && !(msg.content.search(/apple/i)===-1) || !(msg.content.search(/🍎/i)===-1) || !(msg.content.search(/ apple/i)===-1)) {
    msg.react("🍎");
  } 
  if (!(msg.content.search(/pinea/i)===-1) || !(msg.content.search(/🍍/i)===-1)) {
    msg.react("🍍");
  } 
  if (!(msg.content.search(/ueb/i)===-1) || !(msg.content.search(/🫐/i)===-1)) {
    msg.react("🫐");
  } 
  if (!(msg.content.search(/rap/i)===-1) || !(msg.content.search(/🍇/i)===-1)) {
    msg.react("🍇");
  } 
  if (!(msg.content.search(/aterm/i)===-1) || !(msg.content.search(/🍉/i)===-1)){
    msg.react("🍉");
  } 
  if (!(msg.content.search(/awb/i)===-1) || !(msg.content.search(/🍓/i)===-1)){
    msg.react("🍓");
  } 
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
    } else {
      msg.channel.send('!help\n!ping\n!spreadsheet\n!apply\n!say\n!ranked\n!vote\n!voting\n!dvote\ndvotes');
    }
  }

  // simple ping command
  if (command === 'ping') {
    msg.channel.send(`Pong! ${client.ws.ping}ms.`);
  }

  // voting command
  if (command === 'vote') {
    if (msg.member.roles.cache.some(role => role.name === 'Alive') || checkForAdmin()) {
      if (args[0] === undefined) {
        db.get(msg.author.username).then(value => {msg.channel.send('Currently voting for '+value);});
      }
      try {
        let vote = args.join(" ");
        if(filterEveryone(vote) === true) {
          db.set(msg.author.username, vote);
          msg.channel.send('Vote accepted.');
        } else throw filterEveryone(vote);
      } catch(err) {
        msg.channel.send('Something went wrong. Error: '+err);
      }
    } else {
      msg.channel.send('No permission!');
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
      if (args[0] != undefined) {
        db.get(args[0]).then(value => {msg.channel.send(args[0]+': '+value)});
      } else {
        db.list().then(keys => {
        let allVotes = '';
        for (let i=0; i<keys.length; i++) {
          db.get(keys[i]).then(value => {
          allVotes = allVotes+keys[i]+': '+value+'\n';
          if(i===keys.length-1) {
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

  // deletes all votes
  if (command === 'dvotes' && checkForAdmin()) {
    checkForAdmin();
    db.list().then(keys => {
    for (let i=keys.length-1; i>-1; i--) {
      db.delete(keys[i]);
    }
    msg.channel.send('All votes deleted.');
    });
  }
  
  // runs a command, only Cymbalic can use
  if (command === 'run') {
    if (msg.author.id != 644235790901182494) {
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

  // sends a link to S9 applications by !apply or !application
  if (command === 'apply' || command === 'application') {
    msg.channel.send('Applications are not open!');
  }

  // sends a link to the ranked server
  if (command === 'ranked') {
    msg.channel.send('https://discord.gg/E9AKKRttwJ');
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
}
);

client.login(process.env.TOKEN);

// do a funny dm to someone: client.users.fetch('ID GOES HERE').then((user) => {user.send("funny");});