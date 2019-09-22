const brawlStarsDataService = require('../brawlStarsDataService');
const { getDocRefId, readClubTrophyData } = require('../trophyBotDataService');
const { getSortedTrophyPushers } = require('../trophyUtils');

module.exports = list;

async function list(message, args) {

    const listOptions = getOptionsFromArgs(args);

    const clubData = await brawlStarsDataService.getClubData();

    const currentTagToMemberData = await brawlStarsDataService.getCurrentTagToMemberData();
    let oldTagToMemberData;
    try {
        oldTagToMemberData = await readClubTrophyData(getDocRefId(new Date(), listOptions.days));
    }
    catch(error) {
        oldTagToMemberData = await readClubTrophyData(getDocRefId(new Date(), listOptions.days + 1));
    }

    const sortedTrophyPushers = getSortedTrophyPushers(currentTagToMemberData, oldTagToMemberData, listOptions.sortDirection);

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

function getListEmbed(sortedTrophyPushers, clubName, { limit, sortDirection, days }) {
    const timespanText = getTimespanText(days);
    return {
        title: `${sortDirection === 'DESC' ? 'Top' : 'Bottom'} ${limit} Trophy Pushers`,
        description: `The ${sortDirection === 'DESC' ? 'top' : 'bottom'} ${limit} trophy pushers of ${clubName} over the ${timespanText}.`,
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
