import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
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

        this.app = app;
        this.currentUser = null;
        this.auth = app.auth();
        this.db = app.firestore();
        this.firestore = app.firestore;
        this.functions = app.functions();
        this.onUserUpdatedObservers = [];

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
}

export default Firebase;
