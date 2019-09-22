const {
    updateUsernameToTag,
    getValidTag,
} = require('../trophyBotDataService');

module.exports = link;

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
