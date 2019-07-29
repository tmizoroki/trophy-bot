const { getClubData, getTagToMemberData } = require('./brawlStarsDataService');
const { getSortedTrophyPushers } = require('./trophyUtils');
const { saveClubTrophyData, readYesterdaysClubTrophyData } = require('./trophyBotDataService');

module.exports = {
    atMidnight
};

async function atMidnight(date, bot) {
    const newClubData = await getClubData();
    const newTagToMemberData = getTagToMemberData(newClubData);

    saveClubTrophyData(newTagToMemberData, date);

    const yesterdaysTagToMemberData = await readYesterdaysClubTrophyData(date);

    const sortedTrophyPushers = getSortedTrophyPushers(newTagToMemberData, yesterdaysTagToMemberData);

    const leaderboardEmbed = getLeaderboardEmbed(sortedTrophyPushers, date);
    postLeaderboardToChannel(leaderboardEmbed, bot);
}

function getLeaderboardEmbed(sortedTrophyPushers, now, num = 5) {
    return {
        title: `Top ${num} Trophy Pushers`,
        description: `The top ${num} trophy pushers for ${now.toDateString()}`,
        fields: getLeaderboardFields(sortedTrophyPushers, num),
        timestamp: now,
    };

    function getLeaderboardFields(sortedTrophyPushers, num) {
        return Object.values(sortedTrophyPushers).slice(0, num)
                                                .map(toLeaderboardField);
    }

    function toLeaderboardField(member, index) {
        return {
            name: `${index + 1}. ${member.name}`,
            value: `Pushed ${member.trophyDelta} trophies`,
        };
    }
}

function postLeaderboardToChannel(leaderboardEmbed, bot, channelName = 'general') {
    const channel = bot.channels.find('name', channelName);
    channel.send({ embed: leaderboardEmbed});
}
