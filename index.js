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
  // makes ! a prefix and doesn't look at messages without it
  const prefixes = ["!"];
  const prefix = prefixes.find(p => msg.content.startsWith(p));
  // reacts to messages containing fruit with fruit
  if (!(msg.content.search(/🍌/i)===-1) || !(msg.content.search(/bnn/i)===-1) || !(msg.content.search(/ana/i)===-1)) {
    msg.react("🍌");
  } 
  if (!(msg.content.search(/rap/i)===-1) || !(msg.content.search(/🍇/i)===-1)) {
    msg.react("🍇");
  } 
  if (!(msg.content.search(/herry/i)===-1) || !(msg.content.search(/erri/i)===-1) || !(msg.content.search(/🍒/i)===-1) || !(msg.content.search(/eri/i)===-1)) {
    msg.react("🍒");
  } 
  if (!(msg.content.search(/oco/i)===-1) || !(msg.content.search(/🥥/i)===-1)) {
    msg.react("🥥");
  } 
  if (!(msg.content.search(/pinea/i)===-1) || !(msg.content.search(/🍍/i)===-1)) {
    msg.react("🍍");
  } 
  if ((msg.content.search(/apple/i) < msg.content.search(/pineapple/i)) || msg.content.search(/eapple/i)===-1 && !(msg.content.search(/apple/i)===-1) || !(msg.content.search(/🍎/i)===-1) || !(msg.content.search(/ apple/i)===-1)) {
    msg.react("🍎");
  } 
  if (!(msg.content.search(/pear/i)===-1) || !(msg.content.search(/🍐/i)===-1) || !(msg.content.search(/par/i)===-1)) {
    msg.react("🍐");
  } 
  if (!(msg.content.search(/ang/i)===-1) || !(msg.content.search(/🍊/i)===-1)) {
    msg.react("🍊");
  } 
  if (!(msg.content.search(/awb/i)===-1) || !(msg.content.search(/🍓/i)===-1)){
    msg.react("🍓");
  } 
  if (!(msg.content.search(/ueb/i)===-1) || !(msg.content.search(/🫐/i)===-1)) {
    msg.react("🫐");
  } 
  if (!(msg.content.search(/aterm/i)===-1) || !(msg.content.search(/🍉/i)===-1)){
    msg.react("🍉");
  } 
  if (!(msg.content.search(/ngo/i)===-1) || !(msg.content.search(/🥭/i)===-1)) {
    msg.react("🥭");
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
    if (args[0] === 'alliance') {
      msg.channel.send('Currently supports only 2 player alliances. Example command would be:\n!alliance super kedi\nwhere super kedi are both role names. Do not use @s!');
    } else if(args[0] === 'voting') {
      msg.channel.send("Use without arguments to show all votes. Use a username to show only that player's vote.");
    } else {
      msg.channel.send('!help\n!ping\n!spreadsheet\n!apply\n!say\n!alliance\n!stop\n!ranked\n!vote\n!voting\n!dvote');
    }
  }

  // simple ping command
  if (command === 'ping') {
    msg.channel.send(`Pong! ${client.ws.ping}ms.`);
  }

  // voting command
  if (command === 'vote') {
    let text = args.join(" ");
    db.set(msg.author.username, text).then(() => {});
    msg.channel.send('Vote accepted.');
  }

  // removes a vote from selected player
  if (command === 'dvote') {
    try {
      if (!msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) throw 'No permission!';
      db.list().then(keys => {
      let text = args.join(" ");
      for(let i=0;i<keys.length;i++) {
        if(text == keys[i]) {
          db.delete(text).then(() => {});
          msg.channel.send('Vote deleted.');
          return;
        } 
      }
      throw 'Invalid username';
      });
    } catch(err) {
      msg.channel.send('Something went wrong. Error: '+err);
      return;
    }
  }
  
  // gets all votes/selected player's vote
  if (command === 'voting') {
    // tests for permission to use command
    if (!(msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))) {
      msg.channel.send('No permission!');
      return;
    }
    if (args[0] != undefined) {
      db.get(args[0]).then(value => {msg.channel.send(args[0]+': '+value)});
    } else {
      db.list().then(keys => {
      for (let i=0; i<keys.length; i++) {
        db.get(keys[i]).then(value => {
        msg.channel.send(keys[i]+': '+value);
        });
      }
      });
    }
  }
  
  // shut down the bot, only Cymbalic can use
  if (command === 'stop') {
    if (msg.author.id != 644235790901182494) {
      msg.channel.send('No permission!');
    } else {
      msg.channel.send('Shutting down...');
      await new Promise(r => setTimeout(r, 1));
      process.exit();
    }
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

  // sends a link to S7 applications by !apply or !application
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
      let text = args.join(" ");
      if (text === '') return;
      if (!(text.search(/@everyone/)===-1)) throw 'Mentions everyone';
      if (!(text.search(/@here/)===-1)) throw 'Mentions here';
      msg.channel.send(text);
    } catch(err) {
      msg.channel.send('Something went wrong. Error: '+err);
    }
  }

  // makes an alliance of 2 people
  if (command === "alliance") {
    // tests for permission to use command
    if (!(msg.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))) {
      msg.channel.send('No permission!');
      return;
    }
    
    // gets role from name
    const role = [args[0], args[1], args[2]];
    try {
      role[0] = msg.guild.roles.cache.find(role => role.name == args[0]);
      role[1] = msg.guild.roles.cache.find(role => role.name == args[1]);
      role[2] = msg.guild.roles.cache.find(role => role.name == args[2]);
      if(role[0]===undefined || role[1]===undefined) throw 'Invalid role';
      if(role[2]!==undefined) throw 'Too large';
    } catch(err) {
      msg.channel.send('Something went wrong. Error: '+err);
      return;
    }
    
    // create channel
    // this try catch is nessesary to prevent it from crashing on startup
    try {
      msg.guild.channels.create(args[0]+'-'+args[1], {
        type: 'text',
        parent: '907324558862852136',
        permissionOverwrites: [
          {
            id: msg.guild.id,
            deny: ['VIEW_CHANNEL'],
          },
          {
            id: '907056892654796811',
            allow: ['VIEW_CHANNEL'],
            deny: ['SEND_MESSAGES'],
          },
          {
            id: role[0],
            allow: ['VIEW_CHANNEL'],
          },
          {
            id: role[1],
            allow: ['VIEW_CHANNEL'],
          },
        ],
      });
    } catch(err) {
      msg.channel.send('Something went wrong. This message is only here because the bot crashes otherwise and I have no idea why. Error: '+err);
    }
  }
}
);

client.login(process.env.TOKEN);
