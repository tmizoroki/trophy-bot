module.exports = {
    getSortedTrophyPushers,
};

function getSortedTrophyPushers(newTagToMemberData, oldTagToMemberData) {
    const tags = Object.keys(newTagToMemberData);
    return tags.map(toTrophyPusher)
               .sort((a, b) => b.trophyDelta - a.trophyDelta);

    function toTrophyPusher(tag) {
        return {
            tag,
            name: newTagToMemberData[tag].name,
            trophyDelta: getTrophyDelta(newTagToMemberData[tag], oldTagToMemberData[tag]),
        }
    }
}

function getTrophyDelta(newMemberData, oldMemberData) {
    if (oldMemberData) {
        return newMemberData.trophyCount - oldMemberData.trophyCount;
    }
    return null;
}
