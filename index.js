const fs = require('fs');
const { PermissionsBitField, Client, GatewayIntentBits, ChannelType } = require('discord.js');
const fileName1 = './votes.json';
const fileName2 = './reminders.json';
const fileName3 = './remindM.json';
const votes = require(fileName1);
const reminders = require(fileName2);
const remindMessage = require(fileName3);

const allianceCategory = 'alliances'; // all lowercase
const specChannels = [694422951092813824]; // number ids
const privilegedUsers = ['644235790901182494', '640026747051573250']; // string ids
const epoch = 1420070400000;

require('dotenv').config({path:'./auth.env'});

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

// Converts a snowflake ID string into a JS Date object using the provided epoch (in ms), or Discord's epoch if not provided
function convertSnowflakeToDate(snowflake) {
	// Convert snowflake to BigInt to extract timestamp bits
	// https://discord.com/developers/docs/reference#snowflakes
	const milliseconds = BigInt(snowflake) >> 22n
	return new Date(Number(milliseconds) + epoch)
}

// Validates a snowflake ID string and returns a JS Date object if valid
function validateSnowflake(snowflake) {
	if (!Number.isInteger(+snowflake)) {
		throw 'Non-integer snowflake';
	}
	if (snowflake < 4194304) {
		throw 'Too small snowflake';
	}
	const timestamp = convertSnowflakeToDate(snowflake)
	if (Number.isNaN(timestamp.getTime())) {
		throw 'Too big snowflake';
	}
	return timestamp
}

function writeJSON(err) {
	if (err) {
		throw err;
	}
}

function msToTime(s) {
  function pad(n, z) {
    z = z || 2;
    return ('00'+n).slice(-z);
  }
  let ms = s % 1000;
  s = (s - ms) / 1000;
  let secs = s % 60;
  s = (s - secs) / 60;
  let mins = s % 60;
  let hrs = (s - mins) / 60;
	if (hrs > 0) {
		return hrs+':'+pad(mins)+':'+pad(secs)+'.'+pad(ms, 3);
	} else {
		return mins+':'+pad(secs)+'.'+pad(ms, 3);
	}
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//client.on('debug', console.log);

client.on('messageCreate', async msg => {

	const prefixes = ['!'];
  const prefix = prefixes.find(p => msg.content.startsWith(p));

  if (msg.author.bot) return;
  if (!prefix) return;
	
  function isValidMessage(text) {
    if (text.includes('@everyone') || text.includes('@here')) {
      return false;
    }
    return true;
  }

  function assignValue(obj, prop, value) {
    if (typeof prop === 'string') {
      prop = prop.split('.');
    }
    if (prop.length > 1) {
      const e = prop.shift();
      assignValue(obj[e] =
      Object.prototype.toString.call(obj[e]) === '[object Object]'
      ? obj[e]
      : {},
      prop,
      value);
    } else {
      obj[prop[0]] = value;
    }
  }
  
  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const argsJoin = args.join(' ');
	const msgAuthorUsername = msg.author.username;
	const hasAdmin = msg.member.permissions.has(PermissionsBitField.Flags.Administrator);
	const hasMChannels = msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels);
	const isPrivileged = privilegedUsers.includes(msg.author.id);
	const isSpecChannel = specChannels.includes(msg.channel.id);

  if (command === 'help') {
    switch (args[0]) {
      case 'voting':
        msg.channel.send("Use without arguments to show all votes. Use a username to show only that player's vote.");
        break;
      case 'vote':
        msg.channel.send('Casts a vote for the person specified. Leave blank to clear your vote.\nAlias: !v');
        break;
			case 'alliance':
				msg.channel.send('Creates a channel in the "Alliances" category with the roles specified.\nAlias: !a');
				break;
			case 'snowflake':
				msg.channel.send('Calculates the time between two snowflakes (message IDs).\nAlias: !s');
				break;
			case 'remind':
				msg.channel.send('Sends a message to all channels where !setreminder has been used with the message specified by !remindmessage.\nAlias: !r');
				break;
			case 'noremind':
				msg.channel.send('Prevents reminders from being sent in this channel until !resetreminders is used.\nAlias: !nr');
				break;
			case 'setreminder':
				msg.channel.send('Sets this channel to receive reminders from !remind.\nAlias: !setr');
				break;
			case 'remindmessage':
				msg.channel.send('Sets the message to be sent when using !remind.\nAlias: !mesr');
				break;
			case 'resetreminders':
				msg.channel.send('Enables all channels where !setreminder was used to once again receive reminders after !noremind was used.\nAlias: !resr');
				break;
			case '2':
				msg.channel.send('**Ranked Exclusive**\n!vote\n!voting\n!dvote\n!dvotes\n!setvote\nUse **!help 3** for more.');
				break;
			case '3':
				msg.channel.send('!remind\n!noremind\n!setreminder\n!remindmessage\n!resetreminders');
				break;
			default:
        msg.channel.send('!help\n!ping\n!say\n!alliance\n!snowflake\n\nUse **!help 2** for more.');
    }
  }

	// it pings, duh
  if (command === 'ping') {
    const startTime = Date.now();
    msg.channel.send('Pinging...').then((pingMessage) => {
      const endTime = Date.now();
      pingMessage.edit(`Pong! ${endTime - startTime}ms.`);
    });
	}

	// turns off the bot
  if (command === 'stop' && isPrivileged) {
    process.exit();
	}

	// runs a command
  if (command === 'run' && isPrivileged) {
		try {
		eval('async function func() { ' + argsJoin + '}');
    func();
		msg.channel.send('Command success!');
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
  }
  
  // repeats whatever comes next, allows neither @everyone nor @here
  if (command === 'say') {
    try {
			if (argsJoin === '') {
				msg.channel.send('** **');
			} else {
				if (isValidMessage(argsJoin)) {
					msg.channel.send(argsJoin);
				} else throw 'Invalid Message';
			}
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
  }
	
	// creates a channel in category specified in allianceCategory, with the roles specified able to view channel
	if ((command === 'alliance' || command === 'a') && hasMChannels) {
		try {
		if (args.length === 0) throw 'Invalid role(s)';
		const category = msg.guild.channels.cache.find(c => c.name.toLowerCase() == allianceCategory && c.type == ChannelType.GuildCategory);
		if (!category) throw 'Alliances category not found.';
		var topic = '';
		for (let i = 0; i < args.length; i++) {
			topic += args[i]+'-';
		} 
		topic = topic.slice(0, topic.length-1);
		const channel = await msg.guild.channels.create({
			name: topic,
			type: ChannelType.GuildText,
			topic: topic,
			parent: category,
		});
		let role = null;
		for (let i = 0; i < args.length; i++) {
			role = msg.guild.roles.cache.find(r => r.name.toLowerCase() === args[i].toLowerCase());
			if (!role) throw 'Invalid role(s)';
			channel.permissionOverwrites.edit(role, { ViewChannel: true });
		}
		msg.channel.send('Alliance successfully created. <#'+channel+'>');
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
			const errchannel = msg.guild.channels.cache.find(channel => channel.name == topic);
			if (errchannel) errchannel.delete();
		}
	}
	
	if ((command === 'remind' || command === 'r') && hasAdmin) {
		let channel = null;
		let text = remindMessage.message;
		for (let i in reminders) {
			if (reminders[i]) continue;
			channel = msg.guild.channels.cache.find(channel => channel.name == i);
			channel.send(text);
		}
		msg.channel.send('Reminder sent.');
	}
	
	if ((command === 'remindmessage' || command === 'mesr') && hasAdmin) {
		try {
		assignValue(remindMessage, 'message', argsJoin);
		fs.writeFile(fileName3, JSON.stringify(remindMessage), writeJSON);
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
		msg.channel.send('Message updated.');
	}
	
	if ((command === 'setreminder' || command === 'setr') && hasAdmin) {
		try {
		assignValue(reminders, msg.channel.name, false);
		fs.writeFile(fileName2, JSON.stringify(reminders), writeJSON);
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
		msg.channel.send(msg.channel.name+' added to reminder list.');
	}
	
	if ((command === 'resetreminders' || command === 'resr') && hasAdmin) {
		try {
		for (let i in reminders) {
			assignValue(reminders, i, false);
		}
		fs.writeFile(fileName2, JSON.stringify(reminders), writeJSON);
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
	}
	
	if (command === 'noremind' || command === 'nr') {
		try {
    assignValue(reminders, msg.channel.name, true);
		fs.writeFile(fileName2, JSON.stringify(reminders), writeJSON);
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
	}
	
	if (command === 'snowflake' || command === 's') {
		try {
    const snowflake1 = validateSnowflake(args[0]);
		const snowflake2 = validateSnowflake(args[1]);
		if (snowflake1-snowflake2 > 0) { 
			msg.channel.send(msToTime(snowflake1-snowflake2)); 
		} else { 
			msg.channel.send(msToTime(snowflake2-snowflake1)); 
		}
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
	}

	if (msg.guild.id != '694391465673228318') return;
	
	// sends a link to the ranked spreadsheet
  if (command === 'spreadsheet' || command === 'sheet') {
    msg.channel.send('https://docs.google.com/spreadsheets/d/1Ne3NzkaSV1boKZZHuzbeKdkBCzj9j6Sfy9x7f6sX0v8/edit?usp=sharing');
  } 

  // stores a vote in votes.json tied to username
  if (command === 'vote' || command === 'v') {
		try {
    if (msg.member.roles.cache.some(role => role.name === 'Alive') || hasAdmin) {
      if (args[0] == undefined) {
				assignValue(votes, msgAuthorUsername, '');
				msg.channel.send('Vote deleted.');
			} else {
				if (!isValidMessage(args[0])) throw 'Invalid Vote';
				assignValue(votes, msgAuthorUsername, argsJoin);
				fs.writeFile(fileName1, JSON.stringify(votes), writeJSON);
				msg.channel.send('Vote accepted.');
			}
    }
		} catch (err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
  }

  // same as !vote but used by admins to manually set votes for other players
  if (command === 'setvote' && hasAdmin) {
		try {
			assignValue(votes, args[0], args[1]);
			fs.writeFile(fileName1, JSON.stringify(votes), writeJSON);
			msg.channel.send('Vote accepted.');
		} catch(err) {
			msg.channel.send('Something went wrong. Error: ' + err);
		}
	}

  // removes a vote from selected player (sets the vote to an empty string)
  if (command === 'dvote' && hasAdmin) {
  try {
    assignValue(votes, args[0], '');
    fs.writeFile(fileName1, JSON.stringify(votes), writeJSON);
    msg.channel.send('Vote deleted.');
  } catch(err) {
    msg.channel.send('Something went wrong. Error: ' + err);
	}
	}
 
  // gets all votes if used by admin or in specified channel
	if (command === 'voting') {
		try {
		if (isSpecChannel || hasAdmin) {
			let allVotes = '';
			Object.entries(votes).forEach(([key, value]) => {
				allVotes += key + ': ' + value + '\n';
			});
			if (allVotes == '') throw 'No votes found.';
			msg.channel.send(allVotes);
		}
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
	}

  // deletes all votes
  if (command === 'dvotes' && hasAdmin) {
    Object.entries(votes).forEach(([key, value]) =>
			assignValue(votes, key, '')
		);
		fs.writeFile(fileName1, JSON.stringify(votes), writeJSON);
		msg.channel.send('All votes deleted.');
  }
});

client.login(process.env.TOKEN);

// do a funny dm to someone: client.users.fetch('ID GOES HERE').then((user) => {user.send("funny");});
// do a funny message to a channel: client.channels.cache.get('CHANNEL ID').send('funny');