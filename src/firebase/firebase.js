import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import _ from 'lodash';
import firebase from 'firebase';

const firebaseConfig = {
    apiKey: 'AIzaSyDedbwugU4axXQG20TPK63RCBWqMVdc3hA',
    authDomain: 'simplevr-stage.firebaseapp.com',
    projectId: 'simplevr-stage',
    storageBucket: 'simplevr-stage.appspot.com',
    messagingSenderId: '13689155429',
    appId: '1:13689155429:web:f362fa80462b5b88e87b8c',
    measurementId: 'G-9TNR7X5YDJ',
};

class Firebase {
    constructor() {
        if (!firebase.apps.length) {
            app.initializeApp(firebaseConfig);
        }

        this.currentUser = null;
        this.onUserUpdatedObservers = [];

        this.app = app;
        this.auth = app.auth();
        this.db = app.firestore();
        this.storage = app.storage();

        app.auth().onAuthStateChanged((user) => {
            // console.log('onAuthStateChanged', user);
            if (user) {
                this.currentUser = user;
                this.onUserUpdatedObservers.map((observer) => {
                    return observer(user);
                });
            } else {
                // No user is signed in.
                this.currentUser = null;
                this.onUserUpdatedObservers.map((observer) => {
                    return observer(null);
                });
            }
        });
    }

    signOut = () => {
        this.auth.signOut();
    }

    // User
    loadUser = async (id) => {
        const userSnapshot = await this.db.collection('users').doc(id).get();
        if (userSnapshot.exists) {
            return { id: userSnapshot.id, ...userSnapshot.data() };
        }
        return null;
    }

    createUser = async (userData) => {
        const user = _.cloneDeep(userData);
        delete user.id;

        await this.db.collection('users')
            .doc(userData.id)
            .set(user);
    }

    updateUser = async (id, userData) => {
        const user = _.cloneDeep(userData);
        delete user.id;

        await this.db.collection('users')
            .doc(id)
            .set(user, { merge: true });
    }

    loadUserStories = async (userId) => {
        const storiesData = [];

        const stories = await this.db
            .collection('projects')
            .where('userId', '==', userId)
            .get();

        stories.forEach((story) => {
            storiesData.push(story.data());
        });

        return storiesData;
    }

    loadPublicStories = async () => {
        const stories = await this.db
            .collection('projects')
            .where('isPublic', '==', true)
            .get();

        const storyModels = [];
        stories.forEach((story) => {
            storyModels.push(story.data());
        });
        return storyModels;
    }

    saveProject = async (project) => {
        const projectJson = project.toJSON(this.currentUser.uid);

        // Save story data in Firebase Firestore
        await this.db.collection('projects')
            .doc(project.id)
            .set(projectJson, { merge: true });

        // Save story thumbnail image data in Firebase Storage
        await this.uploadFileFromDataUrl(project.thumbnail.getRemoteFilePath(project.id), project.thumbnail.data);

        // Save story soundtrack data in Firebase Storage
        if (project.story.soundtrack.data) {
            await this.uploadFileFromDataUrl(project.story.soundtrack.getRemoteFilePath(project.id), project.story.soundtrack.data);
        }

        // Save story room image data in Firebase Storage
        for (let i = 0; i < project.story.rooms.length; i += 1) {
            const room = project.story.rooms[i];

            await this.uploadFileFromDataUrl(room.panoramaUrl.backgroundImage.getRemoteFilePath(project.id), room.panoramaUrl.backgroundImage.data);
        }
    }

    updateProjectPublicFlag = async (projectId, isPublic) => {
        await this.db.collection('projects')
            .doc(projectId)
            .update({
                isPublic: isPublic,
            });
    }

    uploadFileFromDataUrl = async (uploadPath, fileData) => {
        await this.storage.ref(uploadPath).putString(fileData, firebase.storage.StringFormat.DATA_URL);
    }

    getDownloadUrl = async (remoteFilePath) => {
        return this.storage.ref(remoteFilePath).getDownloadURL();
    }
}

export default Firebase;
