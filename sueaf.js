const fs = require('fs');
const { Permissions } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"]})
//const fileName = './filenamehere.json';
//const json = require(fileName);
require('dotenv').config({path:"./auth.env"});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('debug', console.log);

// actual bot code
client.on('messageCreate', async msg => {
	// filters a message for an empty string, @everyone, and @here
	// returns true when it's allowed, returns false when something is found
	function filterEveryone(text) {
		try {
			if (text === '') throw 'Empty string';
			if (!(text.search(/@everyone/)===-1)) throw 'Mentions everyone';
			if (!(text.search(/@here/)===-1)) throw 'Mentions here';
		} catch(err) {
			return false;
		}
		return true;
	}

	// checks if the message author has admin perms
	function checkForAdmin() {
		if (!(msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))) {
			msg.channel.send('No permission!');
			return false;
		}
		return true;
	}

	// creates or updates a value in an external json file
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
	
	// adds role by mention or username to target
	// r is a string for the role's name
	// target is either a user or username to give the role to
	// message is a string to be sent after, optional
	async function addRole(r, target, message) {
		try {
		var role = await msg.guild.roles.cache.find(role => role.name === r);
		var user = getUserFromMention(target);
		if (user !== null) {
			var member = await msg.guild.members.fetch(user.id);
		} else {
			let x = await client.users.cache.find(user => user.username = target);
			var member = msg.channel.guild.members.cache.find(member => member.user == x);
		}
		if (await target.id !== undefined) {
			var member = msg.channel.guild.members.cache.find(member => member.user == target);
		}
		member.roles.add(role);
		} catch(err) {
			msg.channel.send('Could not find user '+target);
		} 
		if (message != undefined) msg.channel.send(message);
	}
	
	// removes role by mention or username to target
	// r is a string for the role's name
	// target is either a user or username to remove the role from
	// message is a string to be sent after, optional
	async function removeRole(r, target, message) {
		try {
		var role = await msg.guild.roles.cache.find(role => role.name === r);
		var user = getUserFromMention(target);
		if (user !== null) {
			var member = await msg.guild.members.fetch(user.id);
		} else {
			let x = await client.users.cache.find(user => user.username = target);
			var member = msg.channel.guild.members.cache.find(member => member.user == x);
		}
		if (await target.id !== undefined) {
			var member = msg.channel.guild.members.cache.find(member => member.user == target);
		}
		member.roles.remove(role);
		} catch(err) {
			msg.channel.send('Could not find user '+target);
		}
		if (message != undefined) msg.channel.send(message);
	}

	// stock function from discord.js guide, thank you discord.js guide
	function getUserFromMention(mention) {
		if (mention.startsWith('<@') && mention.endsWith('>')) {
			mention = mention.slice(2, -1);
			if (mention.startsWith('!')) {
				mention = mention.slice(1);
			}
			return client.users.cache.get(mention);
		} else {
			let x = client.users.cache.get(mention);
			if (x === undefined) {
				return null;
			} else {
				return x;
			}
		}
	}

	// don't reply to yourself silly
	if (msg.author.bot)
		return;
	
  // makes ! a prefix and doesn't look at messages without it unless specified
	const prefixes = ['$'];
	const prefix = prefixes.find(p => msg.content.startsWith(p));
		if (!prefix) {
			let x = msg.content.toLowerCase();
			if (x == 'dur') msg.channel.send('is, when compared to former-President Ronald Reagan (1911-2004), quite a malicious figure. Even when compared to someone like Margaret Thatcher (1925-2013), it is clear that Dur is comparatively worse across the board, and some might even consider him to be a smelly poo poo. <:sansglasses:566015949338050614>.');
			if (x == 'haha gay lol') msg.channel.send('haha gay lol');
			if (x == 'vore') msg.channel.send('bawbbawbins john willard x potion master vore +18 (GONE WRONG!) free punjabi movie');
			if (x == 'sans') msg.channel.send('is ness');
			if (x == 'poop') msg.channel.send('seagull poop :sans:');
			if (x == 'no u') msg.channel.send('No w');
			if (x == 'u') msg.channel.send('doub le u');
			if (x == 'shut up exe') msg.channel.send('and friends');
			if (x == 'jester') msg.channel.send('<:clown:723860290739109890>');
			if (x == 'snooze') msg.channel.send('u lose');
			return;
		} 

	// splits apart arguments and command
	const args = msg.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	// extra variables to consolidate
	const argsJoin = args.join(' ');
	const msgAuthor = msg.author.id;

	// Global Commands

	// sends a list of all commands (DISABLED ON SUEAF)
	if (command === 'help') {
	// msg.channel.send('!help\n!ping\n!say');
	}

	// simple ping command
	if (command === 'ping') {
	msg.channel.send(`Pong! ${client.ws.ping}ms.`);
	}

	// stops the bot for debugging, only Cymbalic can use
	if (command === 'stop') {
		if (msgAuthor != 644235790901182494 && msgAuthor != 640026747051573250) {
			msg.channel.send('No permission!');
		} else {
			process.exit();
		}
	}

	// runs a command, only Cymbalic can use
	if (command === 'run') {
		if (msgAuthor != 644235790901182494 && msgAuthor != 640026747051573250) {
			msg.channel.send('No permission!');
		} else {
			eval('function func() { ' + args.join(" ") + '}');
			func();
			msg.channel.send('Command success!');
		}
	}

	// repeats whatever comes next
	if (command === 'say') {
		try {
			let string = argsJoin;
			if(filterEveryone(string) === true) {
				msg.channel.send(string);
			} else throw filterEveryone(string);
		} catch(err) {
			msg.channel.send('Something went wrong. Error: '+err);
		}
	}

	// SUEaF Exclusive Commands
	
	if (command === 'kill') {
		if (msg.member.roles.cache.find(role => role.name === 'Mafia' || role.name === 'Vigilante') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, `For his neutral special, ${msg.author} wields a ***G U N***.`);
			}
		}
	}
	
	if (command === 'jail') {
		if (msg.member.roles.cache.find(role => role.name === 'Jailor') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('jailed', argsJoin, 'You successfully jailed '+argsJoin+' for tax evasion <:sansglasses:566015949338050614>');
			}
		}
	}
	
	if (command === 'hex') {
		if (msg.member.roles.cache.find(role => role.name === 'Hex master') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, 'You grab the necronomicon and start absorbing power from your 187 seagulls and cast a spell successfully hexing '+argsJoin);
			}
		}		
	}
	
	if (command === 'douse') {
		if (msg.member.roles.cache.find(role => role.name === 'Arsonist') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('doused', argsJoin, 'You convince '+argsJoin+" to take a bottle of a washing detergent of your own making, too bad it's actually gasoline");
			}
		}
	}
	
	if (command === 'haunt') {
		if (msg.member.roles.cache.find(role => role.name === 'Jester') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, 'You have come to haunt '+argsJoin+' death by showing you the cutout of Justin Bieber (you genuinely flummery your soul out)');
				addRole('dead', msgAuthor);
			}
		}
	}
	
	if (command === 'blackmail') {
		if (msg.member.roles.cache.find(role => role.name === 'Blackmailer') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('blackmailed', argsJoin, 'You condemn '+argsJoin+' to the horrors of the Twitter trending tab. They are so petrified they cease all higher brain functions and therefore cannot speak.');
			}
		}
	}
	
	if (command === 'protect') {
		if (msg.member.roles.cache.find(role => role.name === 'Bodyguard') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('protected', argsJoin, argsJoin+' payed you to protect them. You gladly accept and so you proceed to have passionate gay sex all night for the rest of the week until your testicles eventually deflate.');
			}
		}
	}
	
	if (command === 'maul') {
		if (msg.member.roles.cache.find(role => role.name === 'Werewolf') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, 'You try to have an OwO moment with '+argsJoin+", but they say they aren't into furries so you uwu maul them instead.");
			}
		}
	}
	
	if (command === 'kill5') {
		if (msg.member.roles.cache.find(role => role.name === 'kill4') || checkForAdmin()) {
			if (!filterEveryone(argsJoin)) return;
			addRole('dead', argsJoin, "Honestly there's nothing left to do now, you are so powerful you turn people into a tomato sauce, so you just flex on "+argsJoin+", and they die from witnessing so much D R I P.");
		}
	}
	
	if (command === 'bite') {
		if (msg.member.roles.cache.find(role => role.name === 'Vampire') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('bitten', argsJoin, 'You bite '+argsJoin+' for that sweet sweet blood, but also 13% of income and additional annoyance to jesture guy dude, because he needs to count all that.');
			}
		}
	}
	
	if (command === 'stone') {
		if (msg.member.roles.cache.find(role => role.name === 'Medusa') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, 'Never buy no weed from the mythological creatures..');
			}
		}
	}
	
	if (command === 'poison') {
		if (msg.member.roles.cache.find(role => role.name === 'Poisoner') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, 'You decided to poison '+argsJoin+'. The next day it turns out they died due to peanut allergy. You sick monster...');
			}
		}
	}
	
	if (command === 'pest') {
		if (msg.member.roles.cache.find(role => role.name === 'Pestilence') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, "You cough on "+argsJoin+" instantly killing him. Should've worn a mask.");
			}
		}
	}
	
	if (command === 'lynch') {
		if (msg.member.roles.cache.find(role => role.name === 'Executioner') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				addRole('on trial', argsJoin, 'You successfully lynched '+argsJoin+'. @everyone The trial shall begin in a moment.');
			}
		}
	}
	
	if (command === 'heal') {
		if (msg.member.roles.cache.find(role => role.name === 'Potion master' || role.name === 'Doctor') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('healed', argsJoin, 'You healed '+argsJoin+', but also sold their liver, their right kidney, and their right lung.');
			}
		}
	}
	
	if (command === 'crusade') {
		if (msg.member.roles.cache.find(role => role.name === 'Crusader') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, 'You killed '+argsJoin+' with your holy blade for being degenerate. Your next stop is Rule 34');
			}
		}
	}
	
	if (command === 'trap') {
		if (msg.member.roles.cache.find(role => role.name === 'Trapper') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('protected', argsJoin, 'You set up a trap at '+arg[0]+"'s house. The trap is in actuality a bee with massive nuts. Bees nuts! [There used to be a trap joke, but i deemed it unfunny so I'm gonna replace it with something funnier]");
			}
		}
	}
	
	if (command === 'roleblock' || command === 'rb') {
		if (msg.member.roles.cache.find(role => role.name === 'Escort' || role.name === 'Consort') || checkForAdmin()) {
			if (!filterEveryone(argsJoin)) return;
			addRole('roleblocked', argsJoin, 'You distracted '+argsJoin+' with your distraction dance, after being charged with sexual allegations against minors.');
		}
	}
	
	if (command === 'ambush') {
		if (msg.member.roles.cache.find(role => role.name === 'Ambusher') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, '*Ambushed by foul invention!*');
			}
		}
	}
	
	if (command === 'sanitize' || command === 'clean') {
		if (msg.member.roles.cache.find(role => role.name === 'Janitor') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, 'You clean '+argsJoin+', so you just put them in a bag and steal all their stuff, this includes valuables, personal stuff and info, and also their undies.');
				addRole('cleaned', argsJoin);
			}
		}
	}
	
	if (command === 'skill') {
		if (msg.member.roles.cache.find(role => role.name === 'Serial Killer') || checkForAdmin()) {
			if (!filterEveryone(argsJoin)) return;
			addRole('dead', argsJoin, 'You stabbed '+argsJoin+' so hard they become swiss cheese. You gouda be kidding me!');
		}
	}
	
	if (command === 'pmkill') {
		if (msg.member.roles.cache.find(role => role.name === 'Potion master') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin, 'You threw a Splash Potion of Harming X at '+argsJoin+'. They die immidatelly by contracting hepatitus V');
			}
		}
	}
	
	if (command === 'clkill') {
		if (msg.member.roles.cache.find(role => role.name === 'Coven Leader') || checkForAdmin()) {
			if (!filterEveryone(argsJoin)) return;
			addRole('dead', argsJoin, 'Coven Leader is draining all the cum from '+argsJoin+'. His nuts now look like pair of raisins. '+argsJoin+' later dies of cum deficiency.');
		}
	}
	
	if (command === 'witchkill') {
		if (msg.member.roles.cache.find(role => role.name === 'Witch') || checkForAdmin()) {
			if (!filterEveryone(argsJoin)) return;
			addRole('dead', argsJoin, 'You controlled random townie into killing themselves. This way le cops will never find you. Epic troll <:trollface:720749492751695875>');
		}
	}
	
	if (command === 'banish') {
		if (msg.member.roles.cache.find(role => role.name === 'Geraldo') || checkForAdmin()) {
			if (!filterEveryone(argsJoin)) return;
			addRole('dead', argsJoin, 'You have been banished to the depths of the official SUEAF discord server, where pain and suffering remain');
		}
	}
	
	if (command === 'horny' && checkForAdmin()) {
		addRole('jailed', argsJoin, 'https://cdn.discordapp.com/attachments/762925142170009650/956969111710220288/1648229608092.jpg');
	}
	
	if (command === 'revive') {
		if (msg.member.roles.cache.find(role => role.name === 'Necromancer') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				removeRole('dead', argsJoin, 'You successfully revived '+argsJoin+'. You take your handy dandy necronomicon and proceed to slap the shit out of the dead body until it is alive again.');
				removeRole('doused', argsJoin);
				removeRole('bitten', argsJoin);
				removeRole('kill1', argsJoin);
				removeRole('kill2', argsJoin);
				removeRole('kill3', argsJoin);
				removeRole('kill4', argsJoin);
			}
		}
	}
	
	if (command === 'ignite') {
		if (msg.member.roles.cache.find(role => role.name === 'Arsonist') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				removeRole('doused', argsJoin);
				addRole('dead', argsJoin, 'You ignited '+argsJoin+"'s house with them inside. Industrial revolution and it's consequences...");
			}
		}
	}
	
	if (command === 'kill1') {
		if (msg.member.roles.cache.find(role => role.name === 'Juggernaut') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('kill1', msgAuthor);
				addRole('dead', argsJoin, 'You punched '+argsJoin+' so hard they die of death, you feel great! You received a new power up!');
			}
		}
	}
	
	if (command === 'kill2') {
		if (msg.member.roles.cache.find(role => role.name === 'kill1') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('kill2', msgAuthor);
				addRole('dead', argsJoin, 'You punch '+argsJoin+' so hard they flied over half the Cairo. Now [the World] shall be yours. Good job!');
			}
		}
	}
	
	if (command === 'kill3') {
		if (msg.member.roles.cache.find(role => role.name === 'kill2') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('kill3', msgAuthor);
				addRole('dead', argsJoin, 'You punch '+argsJoin+' so hard the skeleton comes out of them and they become sands undertlae! <:sansglasses:566015949338050614>');
			}
		}
	}
	
	if (command === 'kill4') {
		if (msg.member.roles.cache.find(role => role.name === 'kill3') || checkForAdmin()) {
			if (!filterEveryone(argsJoin)) return;
			addRole('kill4', msgAuthor);
			addRole('dead', argsJoin, 'You punched '+argsJoin+' so hard that they become spaghetti');
		}
	}
	
	if (command === 'unjail') {
		if (msg.member.roles.cache.find(role => role.name === 'Jailor') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				removeRole('jailed', argsJoin, 'You released '+argsJoin+' free.');
			}
		}
	}
	
	if (command === 'execute') {
		if (msg.member.roles.cache.find(role => role.name === 'Jailor') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin);
				removeRole('jailed', argsJoin, 'You executed '+argsJoin+'. Though someone needs to clean up this mess you made');
			}
		}
	}
	
	if (command === 'guilty') {
		if (msg.member.roles.cache.find(role => role.name === 'Executioner') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				addRole('dead', argsJoin);
				removeRole('on trial', argsJoin, 'May God have mercy on your soul.');
			}
		}
	}
	
	if (command === 'innocent') {
		if (msg.member.roles.cache.find(role => role.name === 'Executioner') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				removeRole('on trial', argsJoin, 'You deemed '+argsJoin+' as not guilty. You shall walk freely for now');
			}
		}
	}
	
	if (command === 'arolerole' && checkForAdmin()) {
		addRole(args[1], argsJoin);
		removeRole(args[2], argsJoin, argsJoin+' now has '+args[1]+' instead of '+args[2]);
	}
	
	if (command === 'gapurge') {
		if (msg.member.roles.cache.find(role => role.name === 'Guardian Angel') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				removeRole('dead', argsJoin);
				removeRole('doused', argsJoin);
				removeRole('bitten', argsJoin);
				removeRole('cleaned', argsJoin);
				removeRole('blackmailed', argsJoin, 'The person you are protecting has been purged with holy power of your holiness. Holy! Now hand over your money.');
			}
		}
	}
	
	if (command === 'retrev') {
		if (msg.member.roles.cache.find(role => role.name === 'Retributionist') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				removeRole('dead', argsJoin);
				removeRole('doused', argsJoin);
				removeRole('bitten', argsJoin);
				removeRole('kill1', argsJoin);
				removeRole('kill2', argsJoin);
				removeRole('kill3', argsJoin);
				removeRole('kill4', argsJoin, 'You neatly revive '+argsJoin+" with the power slam jam, and fine them 250<:execent:526405001862578186> for taking your time, while you should've been on the discotheque 5 minutes ago.");
			}
		}
	}
	
	if (command === 'fork') {
		msg.channel.send('You forked Edward Bishop, haha L');
	}
	
	if (command === 'frame') {
		if (msg.member.roles.cache.find(role => role.name === 'Framer') || checkForAdmin()) { 
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				msg.channel.send('Your framed '+argsJoin+' but it seems that it did nothing, since there is no TI, haha gay lol');
			}
		}
	}
	
	if (command === 'controll') {
		if (msg.member.roles.cache.find(role => role.name === 'Coven Leader' || role.name === 'Witch') || checkForAdmin()) { 
			if (!filterEveryone(argsJoin)) return;
			msg.channel.send('You controlled '+argsJoin+'. You made them do your dishes, laundry and eating your ass. Money well spent.');
		}
	}
	
	if (command === 'magic') {
		if (msg.member.roles.cache.find(role => role.name === 'Coven') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				msg.channel.send('You used some magic on '+argsJoin+'. They claim to feel quite funny, while you go on to sell their liver on a black market to waste your money on TF2 crates.');
			}
		}
	}
	
	if (command === 'reveal') {
		if (msg.member.roles.cache.find(role => role.name === 'Potion master') || checkForAdmin()) { 
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				msg.channel.send('You reveal '+argsJoin+' that everyone wrong and you are right, and if someone disagrees with you, they are an idiot! Nobody liked it so everyone is going to now throw tomatoes at you and make fun of you, while you "rightfully" defend your baseless opinion.');
			}
		}
	}
	
	if (command === 'money') {
		if (msg.member.roles.cache.find(role => role.name === 'John Billiard')) msg.channel.send('To show how wealthy you are, you proceed to take a bath in a gold. It is too late to realise that liquid gold is actually hot enough to melt you altogether... but at least they know you are rich right????');
	}
	
	if (command === 'disguise') {
		if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
			if (msg.member.roles.cache.find(role => role.name === 'Disguiser') || checkForAdmin()) msg.channel.send('Hey, how about you stop disguising yourself and find out who ***you*** really are, huh?');
		}
	}
	
	if (command === 'forge') {
		if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
			if (msg.member.roles.cache.find(role => role.name === 'Forger') || checkForAdmin()) msg.channel.send("You forge some wills. While you're at it, you forge your divorce papers and allimony so that you can win the case against your ex-wife.");
		}
	}
	
	if (command === 'hypnotise') {
		if (msg.member.roles.cache.find(role => role.name === 'Hypnotist') || checkForAdmin()) { 
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				msg.channel.send('You hypnotise '+argsJoin+' into thinking they are gay and the first thing they do is to watch JoJo part 5. Good job!');
			}
		}
	}
	
	if (command === 'investigate') {
		if (msg.member.roles.cache.find(role => role.name === 'Consigliere' || role.name === 'Investigator') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				msg.channel.send('You investigate '+argsJoin+", or should i say you investiGAY them! (yes i know it's an awful joke)");
			}
		}
	}
	
	if (command === 'bug') {
		if (msg.member.roles.cache.find(role => role.name === 'Spy') || checkForAdmin()) {
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {			
				if (!filterEveryone(argsJoin)) return;
				msg.channel.send('You keep bugging '+argsJoin+", because of the stole pokemon cards they took from you in primary school. Too bad your spying techniques won't help you because they're about to kick your ass");
			}
		}
	}
	
	if (command === 'vision') {
		if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
			if (msg.member.roles.cache.find(role => role.name === 'Psychic') || checkForAdmin()) msg.channel.send('Your vision has revealed that 1 of the person in the town is gay. Though everyone claims not to be, that leaves you as the odd one out.');
		}
	}
	
	if (command === 'alert') {
		if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
			if (msg.member.roles.cache.find(role => role.name === 'Veteran') || checkForAdmin()) msg.channel.send('You invited some people over for some popcorn party. Though being a senile old grandpa you somewhat forgot that microwavable popcorn triggers your PTSD. Oops!');
		}
	}
	
	if (command === 'interrogate') {
		if (msg.member.roles.cache.find(role => role.name === 'Sheriff') || checkForAdmin()) { 
			if (!msg.member.roles.cache.find(role => role.name === 'roleblocked') || checkForAdmin()) {
				if (!filterEveryone(argsJoin)) return;
				msg.channel.send('You interrogate '+argsJoin+", and that mother darn tarnation keeps fucking your dang cows and shit. Unfortunatelly yer a dumb son of a gun and can do non' aboutit.");
			}
		}
	}
	
});

client.login(process.env.TOKEN);

// do a funny dm to someone: client.users.fetch('ID GOES HERE').then((user) => {user.send("funny");});
// do a funny message to a channel: client.channels.cache.get('CHANNEL ID').send('funny');