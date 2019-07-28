const Discord = require('discord.js');
const commandToHandler = require('./commandHandlerService');
const { TROPHY_BOT_PREFIX } = require('./constants');
const { TROPHY_BOT_TOKEN } = require('./config');

const bot = new Discord.Client();

bot.once('ready', onReady);
bot.on('message', onMessage);
bot.login(TROPHY_BOT_TOKEN);

async function onMessage(msg) {
    if (!getIsTrophyBotRequest(msg)) {
        return;
    }

    processTrophyBotInput(msg);
}

function onReady() {
    console.log('TrophyBot is Ready')
}

function processTrophyBotInput(msg) {
    const [command, ...commandArgs] = msg.content.slice(TROPHY_BOT_PREFIX.length)
                                                 .trim()
                                                 .split(' ')
                                                 .map(arg => arg.toLowerCase());

    commandToHandler[command](msg, commandArgs);
}

function getIsTrophyBotRequest(msg) {
    return msg.content.startsWith(TROPHY_BOT_PREFIX);
}
