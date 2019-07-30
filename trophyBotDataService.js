const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  })
});

const firestore = admin.firestore();


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
