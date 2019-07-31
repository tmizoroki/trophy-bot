const Discord = require('discord.js');
const schedule = require('node-schedule');

const commandToHandler = require('./commandHandlerService');
const { atDailyDealsReset } = require('./trophyPusherLeaderboardService');
const { TROPHY_BOT_PREFIX } = require('./constants');

const bot = new Discord.Client();

bot.once('ready', onReady);
bot.on('message', onMessage);
bot.login(process.env.TROPHY_BOT_TOKEN);

function onReady() {
    schedule.scheduleJob('0 1 * * *', date => atDailyDealsReset(date, bot)) // run everyday at midnight
    console.log('TrophyBot is Ready');
}

async function onMessage(message) {
    if (!message.content.startsWith(TROPHY_BOT_PREFIX)) {
        return;
    }

    const [command, ...commandArgs] = message.content.slice(TROPHY_BOT_PREFIX.length)
                                                     .trim()
                                                     .split(' ')
                                                     .map(arg => arg.toLowerCase());

    commandToHandler[command](message, commandArgs);
}
