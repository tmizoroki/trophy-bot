const {
    getConfig,
    setConfig,
} = require('../trophyBotDataService');

module.exports = config;

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
