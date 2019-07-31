
const brawlStarsDataService = require('./brawlStarsDataService');
const { updateUsernameToTag } = require('./trophyBotDataService');

module.exports = {
    list,
    link,
};

async function link(message, [tag]) {
    if (!tag) {
        message.reply('Please provide your Brawl Stars player tag as an additional argument. E.g. "!trophy link <TAG>"');
        return;
    }
    await updateUsernameToTag(message.author.username, tag)
        .catch(error => {
            console.error(`Error linking username: ${username} to tag: ${tag}`, error);
            message.reply('There was a problem creating the link.')
        });

    console.log(`usernameToTag updated with ${message.author.username} linked to ${tag}`);
    message.reply(`Successfully created link to Tag: ${tag}`);
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
