const { getClubData, getTagToMemberData } = require('./brawlStarsDataService');
const { getSortedTrophyPushers } = require('./trophyUtils');
const { saveClubTrophyData, readYesterdaysClubTrophyData, readLastWeeksClubTrophyData, getConfig } = require('./trophyBotDataService');

module.exports = {
  atDailyDealsReset,
  atStartOfWeek,
};

async function atDailyDealsReset(date, bot) {
  const newClubData = await getClubData();
  const newTagToMemberData = getTagToMemberData(newClubData);

  saveClubTrophyData(newTagToMemberData, date);

  const yesterdaysTagToMemberData = await readYesterdaysClubTrophyData(date);

  const sortedTrophyPushers = getSortedTrophyPushers(newTagToMemberData, yesterdaysTagToMemberData);

  const leaderboardEmbed = getLeaderboardEmbed(sortedTrophyPushers, date);
  postLeaderboardToChannel(leaderboardEmbed, bot);
}

async function atStartOfWeek(date, bot) {
  const newClubData = await getClubData();
  const newTagToMemberData = getTagToMemberData(newClubData);

  const lastWeeksTagToMemberData = await readLastWeeksClubTrophyData(date);

  const sortedTrophyPushers = getSortedTrophyPushers(newTagToMemberData, lastWeeksTagToMemberData);

  const leaderboardEmbed = {
    title: `Top 5 Trophy Pushers of the Last 7 Days`,
    description: `The top 5 trophy pushers for ${date.toDateString()}`,
    fields: getLeaderboardFields(sortedTrophyPushers, 5),
    timestamp: date,
  };
  postLeaderboardToChannel(leaderboardEmbed, bot);
}

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

function getLeaderboardEmbed(sortedTrophyPushers, date, num = 5) {
  return {
    title: `Top ${num} Trophy Pushers of the Last 24 Hours`,
    description: `The top ${num} trophy pushers for ${date.toDateString()}`,
    fields: getLeaderboardFields(sortedTrophyPushers, num),
    timestamp: date,
  };
}

function postLeaderboardToChannel(leaderboardEmbed, bot, channelName = 'trophy-reports') {
  const channel = bot.channels.find('name', channelName);
  channel.send({ embed: leaderboardEmbed });
}
