const BrawlStars = require('brawlstars');
const { BRAWL_API_TOKEN } = require('./config');
const brawlStarsClient = new BrawlStars.Client({ token: BRAWL_API_TOKEN });

module.exports = {
    getClubData,
    getTagToMemberData,
};

function getClubData(clubId = 'vlyl2q') {
    return brawlStarsClient.getClub(`#${clubId.toUpperCase()}`);
}

function getTagToMemberData(clubData) {
    return clubData.members.reduce(toTagToMemberData, {});

    function toTagToMemberData(tagToMemberData, { tag, name, trophies: trophyCount}) {
        tagToMemberData[tag] = { name, trophyCount };
        return tagToMemberData;
    }
}
