const firebase = require('firebase');
const { FIREBASE_CONFIG } = require('./config');

firebase.initializeApp(FIREBASE_CONFIG);
const firestore = firebase.firestore();

module.exports = {
    saveClubTrophyData,
    readYesterdaysClubTrophyData,
}

async function saveClubTrophyData(tagToMemberData, now) {
    const docRefId = getFormattedDate(now);
    await firestore.collection('memberTrophyData').doc(docRefId).set({
      timestamp: now,
      tagToMemberData,
    })
    .catch(error => { console.error("Error adding document: ", error); });
  
    console.log("Document written with ID: ", docRefId);
}

async function readYesterdaysClubTrophyData(date) {
    const yesterdaysDocRefId = getYesterdaysDocRefId(date);
    const { tagToMemberData } = await readClubTrophyData(yesterdaysDocRefId);
    return tagToMemberData;
}

function getFormattedDate(now) {
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

async function readClubTrophyData(docRefId) {
    const document = await firestore.collection('memberTrophyData')
                                    .doc(docRefId)
                                    .get()
                                    .catch(error => console.log('Error getting document', error));

    if (!document.exists) {
        console.log('No such document');
    }

    return document.data();
}

function getYesterdaysDocRefId(date) {
    date.setDate(date.getDate() - 1);

    return getFormattedDate(date);
}
