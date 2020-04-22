/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
admin.initializeApp()
const db = admin.firestore();

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    const snapshot = await admin.database().ref('/messages').push({ original: original });
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref.toString());
});

exports.modifyUser = functions.region('europe-west1').firestore
    .document('following/{followingID}')
    .onWrite((change, context) => {
        // Get an object with the current document value.
        // If the document does not exist, it has been deleted.
        const document = change.after.exists ? change.after.data() : null;

        // Get an object with the previous document value (for update or delete)
        const oldDocument = change.before.data();

        if (document) {
            const followerId = document.follower;
            const followedId = document.followed;

            db.doc(`users/${followerId}`).get().then(function (doc) {
                if (doc.exists) {
                    const userData = doc.data();
                    let newFollowed = userData.followed || { id_users: [] };
                    newFollowed.id_users.push(followedId);
                    db.doc(`users/${followerId}`).update({ followed: newFollowed });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            })

            db.doc(`users/${followedId}`).get().then(function (doc) {
                if (doc.exists) {
                    const userData = doc.data();
                    let newFollower = userData.followers || { id_users: [] };
                    newFollower.id_users.push(followerId);
                    db.doc(`users/${followedId}`).update({ followers: newFollower });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            })

        } else {
            const followerId = oldDocument.follower;
            const followedId = oldDocument.followed;

            db.doc(`users/${followerId}`).get().then(function (doc) {
                if (doc.exists) {
                    const userData = doc.data();
                    let newFollowed = userData.followed || { id_users: [] };
                    newFollowed.id_users = newFollowed.id_users.filter(item => item !== followedId);
                    db.doc(`users/${followerId}`).update({ followed: newFollowed });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            })

            db.doc(`users/${followedId}`).get().then(function (doc) {
                if (doc.exists) {
                    const userData = doc.data();
                    let newFollower = userData.followers || { id_users: [] };
                    newFollower.id_users = newFollower.id_users.filter(item => item !== followerId);
                    db.doc(`users/${followedId}`).update({ followers: newFollower });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            })
        }

        // perform desired operations ...
    });

 exports.addLike = functions.region('europe-west1').firestore
    .document('likes/{likeID}')
    .onWrite((change, context) => {
        // Get an object with the current document value.
        // If the document does not exist, it has been deleted.
        const document = change.after.exists ? change.after.data() : null;

            db.doc(`videos/${videoID}`).get().then(function (doc) {
                if (doc.exists) {
                    const likes = doc.data().likes;
                    let newLike = likes + 1;
                    db.doc(`videos/${videoID}`).update({ likes: newLike });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            })
        // perform desired operations ...
    });

    exports.addComment = functions.region('europe-west1').firestore
    .document('comment/{commentoID}')
    .onWrite((change, context) => {
        // Get an object with the current document value.
        // If the document does not exist, it has been deleted.
        const document = change.after.exists ? change.after.data() : null;

            db.doc(`videos/${videoID}`).get().then(function (doc) {
                if (doc.exists) {
                    const comments = doc.data().comments;
                    const index = comments.length + 1
                    comments[index] = {newcomment}
                    
                    db.doc(`videos/${videoID}`).update({ comments: comments });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            })
        // perform desired operations ...
    });