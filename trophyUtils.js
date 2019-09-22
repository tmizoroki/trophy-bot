module.exports = {
    getSortedTrophyPushers,
};

function getSortedTrophyPushers(newTagToMemberData, oldTagToMemberData, direction = 'DESC') {
    const tags = Object.keys(newTagToMemberData);
    return tags.map(toTrophyPusher)
               .filter(trophyPusher => trophyPusher.trophyDelta !== null)
               .sort(getComparator(direction));

    function toTrophyPusher(tag) {
        return {
            tag,
            name: newTagToMemberData[tag].name,
            trophyDelta: getTrophyDelta(newTagToMemberData[tag], oldTagToMemberData[tag]),
        }
    }
}

function getComparator(direction) {
    if (direction === 'ASC') {
        return (a, b) => a.trophyDelta - b.trophyDelta;
    }
    else if (direction === 'DESC') {
        return (a, b) => b.trophyDelta - a.trophyDelta;
    }
}

function getTrophyDelta(newMemberData, oldMemberData) {
    if (oldMemberData) {
        return newMemberData.trophyCount - oldMemberData.trophyCount;
    }
    return null;
}
