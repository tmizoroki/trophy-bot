const Discord = require('discord.js');
const BrawlStars = require('brawlstars');
const { TROPHY_BOT_TOKEN, BRAWL_API_TOKEN } = require('./config');

const bot = new Discord.Client();
const brawlStarsClient = new BrawlStars.Client({ token: BRAWL_API_TOKEN });

const TROPHY_BOT_PREFIX = '!trophy';

const commandToHandler = {
    async list(msg, [clubId]) {
        const clubData = await getClubData(brawlStarsClient, clubId);
        const tagToMemberData = getTagToMemberData(clubData);
        const text = Object.values(tagToMemberData).slice(0, 5).map(member => `${member.name}: ${member.trophyCount} trophies`).join('\n')
        msg.channel.send(text);
    }
}

bot.on('ready', () => { console.log('Trophy Bot is ready!'); });

bot.on('message', onMessage);

bot.login(TROPHY_BOT_TOKEN);

async function onMessage(msg) {
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

function getClubData(client, clubId = 'vlyl2q') {
    return client.getClub(`#${clubId.toUpperCase()}`);
}

function getTagToMemberData(clubData) {
    return clubData.members.reduce(toTagToMemberData, {});

    function toTagToMemberData(tagToMemberData, { tag, name, trophies: trophyCount}) {
        tagToMemberData[tag] = { name, trophyCount };
        return tagToMemberData;
    }
}