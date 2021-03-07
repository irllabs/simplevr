import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import _ from 'lodash'
import firebase from 'firebase'

var firebaseConfig = {
    apiKey: "AIzaSyDedbwugU4axXQG20TPK63RCBWqMVdc3hA",
    authDomain: "simplevr-stage.firebaseapp.com",
    projectId: "simplevr-stage",
    storageBucket: "simplevr-stage.appspot.com",
    messagingSenderId: "13689155429",
    appId: "1:13689155429:web:f362fa80462b5b88e87b8c",
    measurementId: "G-9TNR7X5YDJ"
};

class Firebase {
    constructor () {
        if (!firebase.apps.length) {
            app.initializeApp(firebaseConfig);
        }

        // add this for local function development
        //app.functions().useFunctionsEmulator('http://localhost:5001')

        this.app = app;
        this.currentUser = null;
        this.auth = app.auth();
        this.db = app.firestore();
        this.firestore = app.firestore;
        this.functions = app.functions()
        this.onUserUpdatedObservers = [];

        app.auth().onAuthStateChanged((user) => {
            // console.log('onAuthStateChanged', user);
            if (user) {
                this.currentUser = user;
                this.onUserUpdatedObservers.map(observer => observer(user));
            } else {
                // No user is signed in.
                this.currentUser = null;
                this.onUserUpdatedObservers.map(observer => observer(null));
            }
        });
    }

    signOut = () => this.auth.signOut();

    // User
    loadUser = (id) => {
        // console.log('firebase::loadUser()', id);
        return new Promise(async (resolve, reject) => {
            try {
                const userSnapshot = await this.db.collection('users').doc(id).get()
                if (userSnapshot.exists) {
                    resolve({ id: userSnapshot.id, ...userSnapshot.data() })
                } else {
                    resolve(null)
                }
            } catch (e) {
                console.error(e)
            }
        })
    }

    createUser = (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = _.cloneDeep(userData)
            delete user.id
            try {
                await this.db.collection('users')
                    .doc(userData.id)
                    .set(user)
                resolve()
            } catch (e) {
                console.error(e)
            }
        })

    }

    updateUser = (id, userData) => {
        return new Promise(async (resolve, reject) => {
            let user = _.cloneDeep(userData)
            delete user.id
            try {
                await this.db.collection('users')
                    .doc(id)
                    .set(user, { merge: true })
                resolve()
            } catch (e) {
                console.error(e)
            }
        })

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