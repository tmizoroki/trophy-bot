
const brawlStarsDataService = require('./brawlStarsDataService');
const {
    updateUsernameToTag,
    readClubTrophyData,
    getMessageAuthorsTag,
    getValidTag,
    getConfig,
    setConfig,
} = require('./trophyBotDataService');
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
        todaysTagToMemberData = await readClubTrophyData(new Date());
    }
    catch(error) {
        todaysTagToMemberData = await readClubTrophyData(new Date(), 1);
    }

    const sortedTrophyPushers = getSortedTrophyPushers(newTagToMemberData, todaysTagToMemberData, 'DESC');

    const index = sortedTrophyPushers.findIndex(pusher => pusher.tag === tag);
    if (index === -1) {
        message.reply(`The provided tag: ${tag}, does not match any member tag in this club. If you provided the tag as an argument, check that the tag is correct. Otherwise, try relinking your tag.`);
    }
    const rank = sortedTrophyPushers[index].rank;
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

async function list(message, args) {

    const listOptions = getOptionsFromArgs(args);

    const clubData = await brawlStarsDataService.getClubData();

    const newClubData = await brawlStarsDataService.getClubData();
    const newTagToMemberData = brawlStarsDataService.getTagToMemberData(newClubData);
    let oldTagToMemberData;
    try {
        oldTagToMemberData = await readClubTrophyData(new Date(), listOptions.days);
    }
    catch(error) {
        oldTagToMemberData = await readClubTrophyData(new Date(), listOptions.days + 1);
    }

    const sortedTrophyPushers = getSortedTrophyPushers(newTagToMemberData, oldTagToMemberData, listOptions.sortDirection);

    message.channel.send({ embed: getListEmbed(sortedTrophyPushers, clubData.name, listOptions) });
}

function getOptionsFromArgs(args) {
    const defaultOptions = {
        limit: 5,
        days: 0,
        sortDirection: 'DESC',
    }

    if (!args.length) {
        return defaultOptions;
    }

    const sortDirectionIndex = args.findIndex(arg => arg === '--asc' || arg === '--desc');
    const daysIndex = args.findIndex(arg => arg === '--days');
    const limitIndex = args.findIndex(arg => arg === '--limit');

    const options = {
        ...limitIndex != -1 ? { limit: +args[limitIndex + 1] } : {},
        ...daysIndex != -1 ? { days: +args[daysIndex + 1] } : {},
        ...sortDirectionIndex != -1 ? { sortDirection: getSortDirection(args[sortDirectionIndex]) } : {},
    }

    return Object.assign({}, defaultOptions, options);
}

function getSortDirection(arg) {
    return arg.slice(2).toUpperCase();
}

function getListEmbed(sortedTrophyPushers, clubName, { limit, direction, days }) {
    const timespanText = getTimespanText(days);
    return {
        title: `${direction === '--desc' ? 'Top' : 'Bottom'} ${limit} Trophy Pushers`,
        description: `The ${direction === '--desc' ? 'top' : 'bottom'} ${limit} trophy pushers of ${clubName} over the ${timespanText}.`,
        fields: getListFields(sortedTrophyPushers),
        timestamp: new Date(),
    };

    function getTimespanText(days) {
        if (days === 0) {
            return 'current 24 hour period'
        }
        return `past ${days} days`
    }

    function getListFields(sortedTrophyPushers) {
        return Object.values(sortedTrophyPushers).slice(0, limit)
                                                 .map(toListField);
    }

    function toListField(member) {
        return {
            name: `${member.rank}. ${member.name}`,
            value: `${member.trophyDelta} 🏆`,
        };
    }
}

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