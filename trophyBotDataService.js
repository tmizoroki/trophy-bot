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
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
});

const firestore = admin.firestore();

function updateUsernameToTag(username, tag) {
  return firestore.collection('trophyBotConfigs').doc('usernameToTag').update({
    [username]: tag,
  });
}

function getValidTag(tag) {
  if (tag.charAt(0) === '#') {
    tag = tag.slice(1);
  }
  return tag.toUpperCase();
}

function getFormattedDate(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

async function saveClubTrophyData(tagToMemberData, now) {
  const docRefId = getFormattedDate(now);
  await firestore.collection('memberTrophyData').doc(docRefId).set({
    timestamp: now,
    tagToMemberData,
  })
    .catch((error) => { console.error('Error adding document: ', error); });

  console.log('Document written with ID: ', docRefId);
}

function getDocRefId(date, daysAgo = 0) {
  const copiedDate = new Date(date.getTime());
  copiedDate.setDate(copiedDate.getDate() - daysAgo);

  return getFormattedDate(copiedDate);
}

async function readClubTrophyData(docRefId) {
  const document = await firestore.collection('memberTrophyData')
    .doc(docRefId)
    .get()
    .catch((error) => console.log('Error getting document', error));

  if (!document.exists) {
    console.log(`No document for ${docRefId}`);
  }

  const data = await document.data();
  return data.tagToMemberData;
}

async function getMessageAuthorsTag(message) {
  const document = await firestore.collection('trophyBotConfigs')
    .doc('usernameToTag')
    .get()
    .catch((error) => console.error('Error getting usernameToTag document', error));

  const userNameToTag = document.data();
  return userNameToTag[message.author.username];
}

async function getConfig(key) {
  const document = await firestore.collection('trophyBotConfigs')
    .doc('config')
    .get()
    .catch(error => console.error('Error getting config document', error));

    const config = document.data();
    return key ? config[key] : config;
}

async function setConfig(key, value) {
  return firestore.collection('trophyBotConfigs')
    .doc('config')
    .update({ [key]: value });
}

module.exports = {
  getDocRefId,
  saveClubTrophyData,
  readClubTrophyData,
  updateUsernameToTag,
  getMessageAuthorsTag,
  getValidTag,
  getConfig,
  setConfig,
};
