const BrawlStars = require('brawlstars');
const brawlStarsClient = new BrawlStars.Client({ token: process.env.BRAWL_API_TOKEN });

module.exports = {
    getCurrentTagToMemberData,
    getClubData,
    getMemberData,
    getTagToMemberData,
};

async function getCurrentTagToMemberData() {
    const newClubData = await getClubData();
    return getTagToMemberData(newClubData);
}

function getMemberData(memberTag) {
    return brawlStarsClient.getPlayer(`#${memberTag.toUpperCase()}`);
}

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
