
const brawlStarsDataService = require('./brawlStarsDataService');

module.exports = {
    list,
};

async function list(msg, [clubId]) {
    const clubData = await brawlStarsDataService.getClubData();
    const tagToMemberData = brawlStarsDataService.getTagToMemberData(clubData);
    msg.channel.send({ embed: getListEmbed(tagToMemberData) });
}

function getListEmbed(tagToMemberData, num = 5) {
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
