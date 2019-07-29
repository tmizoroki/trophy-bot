const firebase = require('firebase');

firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "bb-stats-f64b6.firebaseapp.com",
    databaseURL: "https://bb-stats-f64b6.firebaseio.com",
    projectId: "bb-stats-f64b6",
    storageBucket: "",
    messagingSenderId: "169567647784",
    appId: "1:169567647784:web:324d1b83ae63aced"
});
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
    const copiedDate = new Date(date.getTime());
    copiedDate.setDate(copiedDate.getDate() - 1);

    return getFormattedDate(copiedDate);
}
