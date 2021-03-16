import firebase from 'firebase';
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import _ from 'lodash';
import Project from '../models/project';
import StorageProject from '../models/storage/StorageProject';
import User from '../models/user';
import ProjectDeserializer from '../service/ProjectDeserializer';
import ProjectSerializer from '../service/ProjectSerializer';

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
    private auth: firebase.auth.Auth;
    private firestore: firebase.firestore.Firestore;
    private storage: firebase.storage.Storage;

    private currentUser: app.User;
    private onUserUpdatedObservers: Array<(user: firebase.User) => void> = [];

    constructor() {
        if (!firebase.apps.length) {
            app.initializeApp(firebaseConfig);
        }

        this.auth = app.auth();
        this.firestore = app.firestore();
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

    public signOut = () => {
        this.auth.signOut();
    }

    // User
    public loadUser = async (id: string) => {
        const userSnapshot = await this.firestore.collection('users').doc(id).get();
        if (userSnapshot.exists) {
            return { id: userSnapshot.id, ...userSnapshot.data() };
        }
        return null;
    }

    public createUser = async (userData: User) => {
        const user = _.cloneDeep(userData);
        delete user.id;

        await this.firestore.collection('users')
            .doc(userData.id)
            .set(user);
    }

    private updateUser = async (id: string, userData: User) => {
        const user = _.cloneDeep(userData);
        delete user.id;

        await this.firestore.collection('users')
            .doc(id)
            .set(user, { merge: true });
    }

    loadUserStories = async (userId: string) => {
        const storiesData: Project[] = [];

        const stories = await this.firestore
            .collection('projects')
            .where('userId', '==', userId)
            .get();

        stories.forEach((story) => {
            storiesData.push(story.data() as Project);
        });

        return storiesData;
    }

    loadPublicStories = async () => {
        const stories = await this.firestore
            .collection('projects')
            .where('isPublic', '==', true)
            .get();

        const storyModels: Project[] = [];
        stories.forEach((story) => {
            storyModels.push(story.data() as Project);
        });
        return storyModels;
    }

    saveProject = async (project: Project) => {
        const projectSerializer = new ProjectSerializer();
        const storageProject = projectSerializer.serialize(project, this.currentUser.uid);

        // Save story data in Firebase Firestore
        await this.firestore.collection('projects')
            .doc(project.id)
            // Firestore does not accept custom objects, so we need to use this method to get pure JS object
            .set(JSON.parse(JSON.stringify(storageProject)), { merge: true });

        // Save story soundtrack data in Firebase Storage
        if (project.story.soundtrack.data) {
            await this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(project.story.soundtrack), project.story.soundtrack.data);
        }

        // Save story rooms data in Firebase Storage
        for (let i = 0; i < project.story.rooms.length; i += 1) {
            const room = project.story.rooms[i];

            await this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(room.panoramaUrl.backgroundImage), room.panoramaUrl.backgroundImage.data);
            await this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(room.panoramaUrl.thumbnail), room.panoramaUrl.thumbnail.data);
            await this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(room.backgroundMusic), room.backgroundMusic.data);
            await this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(room.backgroundNarration), room.backgroundNarration.data);

            // Save room hotspots data in Firebase storage
            for (let j = 0; j < room.hotspots.length; j++) {
                const hotspot = room.hotspots[j];

                await this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(hotspot.image), hotspot.image.data);
                await this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(hotspot.audio), hotspot.audio.data);
            }
        }
    }

    loadProject = async (storageProject: StorageProject): Promise<Project> => {
        const projectDeserializer = new ProjectDeserializer();

        return await projectDeserializer.deserialize(storageProject);
    }

    updateProjectPublicFlag = async (projectId: string, isPublic: boolean) => {
        await this.firestore.collection('projects')
            .doc(projectId)
            .update({
                isPublic: isPublic,
            });
    }

    uploadFileFromDataUrl = async (uploadPath: string, fileData: string) => {
        if (!fileData) {
            return;
        }
        await this.storage.ref(uploadPath).putString(fileData, firebase.storage.StringFormat.DATA_URL);
    }

    getDownloadUrl = async (remoteFilePath: string) => {
        return this.storage.ref(remoteFilePath).getDownloadURL();
    }
}

export default new Firebase();
