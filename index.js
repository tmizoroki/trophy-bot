const Discord = require('discord.js');
const schedule = require('node-schedule');

const commandToHandler = require('./commandHandlerService');
const { atDailyDealsReset, atStartOfWeek } = require('./trophyPusherLeaderboardService');
const { TROPHY_BOT_PREFIX } = require('./constants');

const bot = new Discord.Client();

function onReady() {
  schedule.scheduleJob('0 1 * * *', (date) => atDailyDealsReset(date, bot)); // run everyday at midnight
  schedule.scheduleJob('0 1 * * 0', (date) => atStartOfWeek(date, bot));
  console.log('TrophyBot is Ready');
}

async function onMessage(message) {
  if (!message.content.startsWith(TROPHY_BOT_PREFIX)) {
    return;
  }

  const [command, ...commandArgs] = message.content.slice(TROPHY_BOT_PREFIX.length)
    .trim()
    .split(' ')
    .map((arg) => arg.toLowerCase());

  commandToHandler[command](message, commandArgs);
}

bot.once('ready', onReady);
bot.on('message', onMessage);
bot.login(process.env.TROPHY_BOT_TOKEN);
