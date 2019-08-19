
const brawlStarsDataService = require('./brawlStarsDataService');
const { updateUsernameToTag, readTodaysClubTrophyData, getMessageAuthorsTag, getValidTag } = require('./trophyBotDataService');
const { getSortedTrophyPushers } = require('./trophyUtils');
const { TROPHY_BOT_PREFIX } = require('./constants');

module.exports = {
    list,
    link,
    rank,
};

async function rank(message, [tagArg]) {
    const isTagArgSupplied = !!tagArg;
    const tag = isTagArgSupplied ? getValidTag(tagArg) : await getMessageAuthorsTag(message);
    if (!tag) {
        message.reply(`You have not yet linked your Brawl Stars tag. Please use the command: ${TROPHY_BOT_PREFIX} link <YOUR_BRAWL_STARS_TAG> (without the # in front)`)
    }
    const newClubData = await brawlStarsDataService.getClubData();
    const newTagToMemberData = brawlStarsDataService.getTagToMemberData(newClubData);
    const todaysTagToMemberData = await readTodaysClubTrophyData(new Date());

    const sortedTrophyPushers = getSortedTrophyPushers(newTagToMemberData, todaysTagToMemberData);

    const index = sortedTrophyPushers.findIndex(pusher => pusher.tag === tag);
    if (index === -1) {
        message.reply(`The provided tag: ${tag}, does not match any member tag in this club. If you provided the tag as an argument, check that the tag is correct. Otherwise, try relinking your tag.`);
    }
    const rank = index + 1;
    const delta = sortedTrophyPushers[index].trophyDelta;
    message.reply(`You are currently in ${rank}${getNumSuffix(rank)} place and have pushed ${delta} trophies`);
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

async function list(msg, [clubId]) {
    const clubData = await brawlStarsDataService.getClubData();
    const tagToMemberData = brawlStarsDataService.getTagToMemberData(clubData);
    msg.channel.send({ embed: getListEmbed(tagToMemberData, clubData) });
}

function getListEmbed(tagToMemberData, clubData, num = 5) {
    return {
        title: `Top ${num} ${clubData.name} members`,
        description: `The top ${num} members of ${clubData.name} by current trophy count.`,
        fields: getListFields(tagToMemberData),
        timestamp: new Date(),
    };

    function getListFields(tagToMemberData) {
        return Object.values(tagToMemberData).slice(0, num)
                                             .map(toListField);
    }

    function toListField(member, index) {
        return {
            name: `${index + 1}. ${member.name} - ${member.trophyCount} trophies`,
            value: 'stuff',
        };
    }
}
