const list = require('./commands/listCommand');
const link = require('./commands/linkCommand');
const rank = require('./commands/rankCommand');
const config = require('./commands/configCommand');

module.exports = {
    list,
    link,
    rank,
    config,
    help,
};

function help(message) {
    const helpLines = [
        '!trophy list           show the top 5 trophy pushers for the current 24 hour period',
        '!trophy link <TAG>     link a brawl stars tag to your discord username',
        '!trophy rank           show your trophy pusher rank for the current 24 hour period'
    ];
    message.channel.send(helpLines.join('\n'));
}
