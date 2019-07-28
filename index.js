const Discord = require('discord.js');
const bot = new Discord.Client();
const { TROPHY_BOT_TOKEN } = require('./config');

const TROPHY_BOT_PREFIX = '!trophy';

const commandToHandler = {
    test(msg, args) {
        const text = ['Command: test', `Arguments: ${args.join(', ')}`].join('\n');
        msg.channel.send(text);
    }
}

bot.on('ready', () => { console.log('Trophy Bot is ready!'); });

bot.on('message', onMessage);

bot.login(TROPHY_BOT_TOKEN);

function onMessage(msg) {
    if (!getIsTrophyBotRequest(msg)) {
        return;
    }

    const [command, ...args] = msg.content.slice(TROPHY_BOT_PREFIX.length)
                                           .trim()
                                           .split(' ');

    const handler = commandToHandler[command.toLowerCase()];
    handler(msg, args);
}

function getIsTrophyBotRequest(msg) {
    return msg.content.startsWith(TROPHY_BOT_PREFIX);
}
