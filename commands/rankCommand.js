

const brawlStarsDataService = require('../brawlStarsDataService');
const {
    getDocRefId,
    readClubTrophyData,
    getMessageAuthorsTag,
    getValidTag,
} = require('../trophyBotDataService');
const { getSortedTrophyPushers } = require('../trophyUtils');
const { TROPHY_BOT_PREFIX } = require('../constants');

module.exports = rank;

async function rank(message, [tagArg]) {
    const isTagArgSupplied = !!tagArg;
    const tag = isTagArgSupplied ? getValidTag(tagArg) : await getMessageAuthorsTag(message);
    if (!tag) {
        message.reply(`You have not yet linked your Brawl Stars tag. Please use the command: ${TROPHY_BOT_PREFIX} link <YOUR_BRAWL_STARS_TAG> (without the # in front)`)
    }

    const currentTagToMemberData = await brawlStarsDataService.getCurrentTagToMemberData();
    const todaysTagToMemberData = await getTodaysTagToMemberData();
    const sortedTrophyPushers = getSortedTrophyPushers(currentTagToMemberData, todaysTagToMemberData, 'DESC');

    const index = sortedTrophyPushers.findIndex(pusher => pusher.tag === tag);
    if (index === -1) {
        message.reply(`The provided tag: ${tag}, does not match any member tag in this club. If you provided the tag as an argument, check that the tag is correct. Otherwise, try relinking your tag.`);
    }
    const rank = sortedTrophyPushers[index].rank;
    const delta = sortedTrophyPushers[index].trophyDelta;
    message.reply(`You have pushed ${delta} trophies today (${rank}${getNumSuffix(rank)} place)`);
}

async function getTodaysTagToMemberData() {
    let todaysTagToMemberData;
    try {
        const todaysDocRefId = getDocRefId(new Date());
        todaysTagToMemberData = await readClubTrophyData(todaysDocRefId);
    }
    catch(error) {
        const todaysDocRefId = getDocRefId(new Date(), 1)
        todaysTagToMemberData = await readClubTrophyData(todaysDocRefId);
    }
    return todaysTagToMemberData;
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
