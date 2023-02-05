const fs = require('fs');
const { PermissionsBitField, Client, GatewayIntentBits, ChannelType } = require('discord.js');
const fileName1 = './votes.json';
const fileName2 = './reminders.json';
const votes = require(fileName1);
const reminders = require(fileName2);

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
	const timestamp = convertSnowflakeToDate(snowflake, epoch)
	if (Number.isNaN(timestamp.getTime())) {
		throw 'Too big snowflake';
	}
	return timestamp
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
	
	function remind() {
		let channel = null;
		for (let i in reminders) {
			if (reminders[i]) continue;
			channel = msg.guild.channels.cache.find(channel => channel.name == i);
			channel.send('@Player, reminder to do x.');
		}
	}
  
  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const argsJoin = args.join(' ');
  const msgAuthorID = msg.author.id;
	const msgAuthorUsername = msg.author.username;
	const hasAdmin = msg.member.permissions.has(PermissionsBitField.Flags.Administrator);
	const hasMChannels = msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels);
	const isPrivileged = privilegedUsers.includes(msgAuthorID);
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
      default:
        msg.channel.send('!help\n!ping\n!say\n!alliance\n\n**Ranked Exclusive**\n!vote\n!voting\n!dvote\n!dvotes\n!setvote');
        break;
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
			role = msg.guild.roles.cache.find(r => r.name === args[i]);
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
	
	if (command === 'setreminder' || command === 'sr') {
		assignValue(reminders, msg.channel.name, false);
		msg.channel.send(msg.channel.name+' added to reminder list.');
	}
	
	if (command === 'finish') {
		try {
    assignValue(reminders, msg.channel.name, true);
		fs.writeFile(fileName2, JSON.stringify(reminders), function writeJSON(err) {
			if (err) {
				throw err;
			}
			console.log('writing to ' + fileName2);
		});
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
	}
	
	if (command === 'snowflake') {
    const startTime = Date.now();
    msg.channel.send('Pinging...').then((pingMessage) => {
      const endTime = Date.now();
      pingMessage.edit(`Pong! ${endTime - startTime}ms.`);
    });
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
				fs.writeFile(fileName1, JSON.stringify(votes), function writeJSON(err) {
					if (err) {
						throw err;
					}
					msg.channel.send('Vote accepted.');
					console.log('writing to ' + fileName1);
				});
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
			fs.writeFile(fileName1, JSON.stringify(votes), function writeJSON(err) {
				if (err) {
					throw err;
				} else {
					msg.channel.send('Vote accepted.');
					console.log('writing to ' + fileName1);
				}
			});
		} catch(err) {
			msg.channel.send('Something went wrong. Error: ' + err);
		}
	}

  // removes a vote from selected player (sets the vote to an empty string)
  if (command === 'dvote' && hasAdmin) {
  try {
    assignValue(votes, args[0], '');
    fs.writeFile(fileName1, JSON.stringify(votes), function writeJSON(err) {
      if (err) {
        throw err;
      } else {
        msg.channel.send('Vote deleted.');
        console.log('writing to ' + fileName1);
      }
    });
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
		fs.writeFile(fileName1, JSON.stringify(votes), function writeJSON(err) {
      if (err) {
				return console.log(err);
			} else {
				msg.channel.send('All votes deleted.');
				console.log('writing to ' + fileName1);
			}
		});
  }
});

client.login(process.env.TOKEN);

// do a funny dm to someone: client.users.fetch('ID GOES HERE').then((user) => {user.send("funny");});
// do a funny message to a channel: client.channels.cache.get('CHANNEL ID').send('funny');