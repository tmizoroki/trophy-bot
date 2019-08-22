
const brawlStarsDataService = require('./brawlStarsDataService');
const { updateUsernameToTag, readTodaysClubTrophyData, readYesterdaysClubTrophyData, getMessageAuthorsTag, getValidTag, getConfig } = require('./trophyBotDataService');
const { getSortedTrophyPushers } = require('./trophyUtils');
const { TROPHY_BOT_PREFIX } = require('./constants');

module.exports = {
    list,
    link,
    rank,
    config,
    help,
};

async function rank(message, [tagArg]) {
    const isTagArgSupplied = !!tagArg;
    const tag = isTagArgSupplied ? getValidTag(tagArg) : await getMessageAuthorsTag(message);
    if (!tag) {
        message.reply(`You have not yet linked your Brawl Stars tag. Please use the command: ${TROPHY_BOT_PREFIX} link <YOUR_BRAWL_STARS_TAG> (without the # in front)`)
    }
    const newClubData = await brawlStarsDataService.getClubData();
    const newTagToMemberData = brawlStarsDataService.getTagToMemberData(newClubData);
    let todaysTagToMemberData;
    try {
        todaysTagToMemberData = await readTodaysClubTrophyData(new Date());
    }
    catch(error) {
        todaysTagToMemberData = await readYesterdaysClubTrophyData(new Date());
    }

    const sortedTrophyPushers = getSortedTrophyPushers(newTagToMemberData, todaysTagToMemberData);

    const index = sortedTrophyPushers.findIndex(pusher => pusher.tag === tag);
    if (index === -1) {
        message.reply(`The provided tag: ${tag}, does not match any member tag in this club. If you provided the tag as an argument, check that the tag is correct. Otherwise, try relinking your tag.`);
    }
    const rank = index + 1;
    const delta = sortedTrophyPushers[index].trophyDelta;
    message.reply(`You have pushed ${delta} trophies today (${rank}${getNumSuffix(rank)} place)`);
}

function getNumSuffix(rank) {
    switch(rank) {
        case 1:
            return `st`;
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

async function link(message, [tag]) {
    if (!tag) {
        message.reply('Please provide your Brawl Stars player tag as an additional argument. E.g. "!trophy link <TAG>"');
        return;
    }
    const validTag = getValidTag(tag);
    await updateUsernameToTag(message.author.username, validTag)
        .catch(error => {
            console.error(`Error linking username: ${message.author.username} to tag: ${validTag}`, error);
            message.reply('There was a problem creating the link.')
        });

    console.log(`usernameToTag updated with ${message.author.username} linked to ${validTag}`);
    message.reply(`Successfully created link to Tag: ${validTag}`);
}

async function list(msg) {
    const clubData = await brawlStarsDataService.getClubData();

    const newClubData = await brawlStarsDataService.getClubData();
    const newTagToMemberData = brawlStarsDataService.getTagToMemberData(newClubData);
    let todaysTagToMemberData;
    try {
        todaysTagToMemberData = await readTodaysClubTrophyData(new Date());
    }
    catch(error) {
        todaysTagToMemberData = await readYesterdaysClubTrophyData(new Date());
    }

    const sortedTrophyPushers = getSortedTrophyPushers(newTagToMemberData, todaysTagToMemberData);

    msg.channel.send({ embed: getListEmbed(sortedTrophyPushers, clubData) });
}

function getListEmbed(sortedTrophyPushers, clubData, num = 5) {
    return {
        title: `Current Top ${num} Trophy Pushers`,
        description: `The top ${num} trophy pushers of ${clubData.name} for the current 24 hour period.`,
        fields: getListFields(sortedTrophyPushers),
        timestamp: new Date(),
    };

    function getListFields(sortedTrophyPushers) {
        return Object.values(sortedTrophyPushers).slice(0, num)
                                                 .map(toListField);
    }

    function toListField(member, index) {
        return {
            name: `${index + 1}. ${member.name}`,
            value: `${member.trophyDelta} 🏆`,
        };
    }
}

async function config(message, [configKey, configValue]) {
    if (!configValue) {
        const currentConfigValue = await getConfig(configKey);
        message.reply(`${configKey}: ${currentConfigValue}`);
    }
    else {
        console.log(`Setting ${configKey} to ${configValue}`);
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