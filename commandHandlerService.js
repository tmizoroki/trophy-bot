const {
    getConfig,
    setConfig,
} = require('./trophyBotDataService');

const list = require('./commands/listCommand');
const link = require('./commands/linkCommand');
const rank = require('./commands/rankCommand');

module.exports = {
    list,
    link,
    rank,
    config,
    help,
};

async function config(message, [configKey, configValue]) {
    const admins = await getConfig('admins');
    const isAdmin = admins.includes(message.author.username);
    if (!isAdmin) {
        message.reply('You\'re not my mom! I don\'t have to listen to you!');
        return;
    }
    if (!configValue) {
        const currentConfigValue = await getConfig(configKey);
        message.reply(`${configKey}: ${currentConfigValue}`);
    }
    else {
        await setConfig(configKey, configValue);
        message.reply(`Set ${configKey} to ${configValue}`);
    }
}

function help(message) {
    const helpLines = [
        '!trophy list           show the top 5 trophy pushers for the current 24 hour period',
        '!trophy link <TAG>     link a brawl stars tag to your discord username',
        '!trophy rank           show your trophy pusher rank for the current 24 hour period'
    ];
    message.channel.send(helpLines.join('\n'));
}
