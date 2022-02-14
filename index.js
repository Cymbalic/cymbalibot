// make a web server to keep the bot online
const express = require('express');
const app = express();
const port = 3000;
app.get('/', (req, res) => res.send('What are you looking for?'));
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

// replit database
const Database = require("@replit/database");
const db = new Database();
console.log(process.env.REPLIT_DB_URL);
db.set("key", "value").then(() => {});
db.list().then(keys => {console.log(keys)});
db.get("key").then(value => {console.log(value)});

// actual bot code
const { Permissions } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async msg => {
  // don't reply to yourself silly
  if (msg.author.bot) return;
  // makes ! a prefix and doesn't look at messages without it
  const prefixes = ["!"];
  const prefix = prefixes.find(p => msg.content.startsWith(p));
  // reacts to messages containing fruit with fruit
  if (!(msg.content.search(/🍌/i)===-1) || !(msg.content.search(/bnn/i)===-1) || !(msg.content.search(/ana/i)===-1)) {
    await msg.react("🍌");
  } 
  if (!(msg.content.search(/rap/i)===-1) || !(msg.content.search(/🍇/i)===-1)) {
    await msg.react("🍇");
  } 
  if (!(msg.content.search(/erry/i)===-1) || !(msg.content.search(/erri/i)===-1) || !(msg.content.search(/🍒/i)===-1) || !(msg.content.search(/eri/i)===-1)) {
    await msg.react("🍒");
  } 
  if (!(msg.content.search(/oco/i)===-1) || !(msg.content.search(/🥥/i)===-1)) {
    await msg.react("🥥");
  } 
  if (!(msg.content.search(/pinea/i)===-1) || !(msg.content.search(/🍍/i)===-1)) {
    await msg.react("🍍");
  } 
  if ((msg.content.search(/apple/i) < msg.content.search(/pineapple/i)) || msg.content.search(/pineapple/i)===-1 && !(msg.content.search(/apple/i)===-1) || !(msg.content.search(/🍎/i)===-1) || !(msg.content.search(/ apple/i)===-1)) {
    await msg.react("🍎");
  } 
  if (!(msg.content.search(/pear/i)===-1) || !(msg.content.search(/🍐/i)===-1) || !(msg.content.search(/par/i)===-1)) {
    await msg.react("🍐");
  } 
  if (!(msg.content.search(/ang/i)===-1) || !(msg.content.search(/🍊/i)===-1)) {
    await msg.react("🍊");
  } 
  if (!(msg.content.search(/awb/i)===-1) || !(msg.content.search(/🍓/i)===-1)){
    await msg.react("🍓");
  } 
  if (!(msg.content.search(/ueb/i)===-1) || !(msg.content.search(/🫐/i)===-1)) {
    await msg.react("🫐");
  } 
  if (!(msg.content.search(/aterm/i)===-1) || !(msg.content.search(/🍉/i)===-1)){
    await msg.react("🍉");
  } 
  if (!(msg.content.search(/ngo/i)===-1) || !(msg.content.search(/🥭/i)===-1)) {
    await msg.react("🥭");
  } 
  if (!prefix) return;
  // splits apart arguments and command
  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // sends a list of all commands
  if (command === 'help') {
    if (args[0] === undefined) {
    msg.channel.send('!help\n!ping\n!spreadsheet\n!apply\n!say\n!alliance');
    } else if (args[0] === 'alliance') {
      msg.channel.send('Currently supports only 2 player alliances. Example command would be:\n!alliance super kedi\nwhere super kedi are both role names. Do not use @s!');
    }
  }

  // simple ping command
  if (command === 'ping') {
    msg.channel.send(`Pong! ${client.ws.ping}ms.`);
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

  // sends a link to the ranked spreadsheet
  if (command === 'spreadsheet' || command === 'sheet') {
    msg.channel.send('https://docs.google.com/spreadsheets/d/1Ne3NzkaSV1boKZZHuzbeKdkBCzj9j6Sfy9x7f6sX0v8/edit?usp=sharing');
  } 

  // sends a link to S7 applications by !apply or !application
  if (command === 'apply' || command === 'application') {
    msg.channel.send('Applications are not open!');
  }
  
  // repeats whatever comes next
  if (command === "say") {
    let text = args.join(" ");
    msg.delete();
    msg.channel.send(text);
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
      msg.channel.send('Something went wrong. You probably listed an invalid role. Remember to use the name of the role, not the @. Error: '+err);
      return;
    }
    
    // create channel
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
      msg.channel.send('Something went wrong. I have no idea how you caused this, please tell Cymbalic about this error. Error: '+err);
    }
  }
}
);

client.login(process.env.TOKEN);
