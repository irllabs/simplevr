
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import _ from 'lodash';
import Door from '../models/door';
import Hotspot from '../models/hotspot';
import ImageAsset from '../models/image-asset';
import Project from '../models/project';
import Room from '../models/room';
import Soundtrack from '../models/soundtrack';
import StorageProject from '../models/storage/StorageProject';
import Story from '../models/story';
import User from '../models/user';
import ProjectDeserializer from '../service/ProjectDeserializer';
import ProjectSerializer from '../service/ProjectSerializer';
import { v1 as uuid } from 'uuid';

const firebaseConfig = {
    apiKey: "AIzaSyDW6z4971LgZRUmcWKCORgce0nRjA68GVs",
    authDomain: "simple-vr.firebaseapp.com",
    projectId: "simple-vr",
    storageBucket: "simple-vr.appspot.com",
    messagingSenderId: "151085359051",
    appId: "1:151085359051:web:d91e0383b58a8dae56a04e",
    measurementId: "G-PS5SVL3CK3"
};

/*const legacyFirebaseConfig = {
    apiKey: "AIzaSyANTmC7-PO3I3XqQxHkI77Rwx5TdMlMrnQ",
    authDomain: "social-vr-161302.firebaseapp.com",
    databaseURL: "https://social-vr-161302.firebaseio.com",
    projectId: "social-vr-161302",
    storageBucket: "social-vr-161302.appspot.com",
    messagingSenderId: "613942124685",
    appId: "1:613942124685:web:9918c2dcc2fc95807482c4"
}*/

class Firebase {
    private legacyApp: firebase.app.App;
    private legacyFirestore: firebase.firestore.Firestore;
    private legacyStorage: firebase.storage.Storage;

    private auth: firebase.auth.Auth;
    private firestore: firebase.firestore.Firestore;
    private storage: firebase.storage.Storage;

    private onUserUpdatedObservers: Array<(user: firebase.User) => void> = [];

    public currentUser: firebase.User;

    constructor() {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);

            /*this.legacyApp = firebase.initializeApp(legacyFirebaseConfig, 'legacy');
            this.legacyFirestore = this.legacyApp.firestore();
            this.legacyStorage = this.legacyApp.storage();*/
        }

        this.auth = firebase.auth();
        this.firestore = firebase.firestore();
        this.storage = firebase.storage();

        this.auth.onAuthStateChanged((user) => {
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

    saveProject = async (project: Project, userId?: string) => {
        const projectSerializer = new ProjectSerializer();
        const storageProject = projectSerializer.serialize(project, userId || this.currentUser.uid);

        // Save story data in Firebase Firestore
        await this.firestore.collection('projects')
            .doc(project.id)
            // Firestore does not accept custom objects, so we need to use this method to get pure JS object
            .set(JSON.parse(JSON.stringify(storageProject)), { merge: true });

        const uploadPromises = [];

        // Save story soundtrack data in Firebase Storage
        if (project.story.soundtrack.data) {
            uploadPromises.push(this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(project.story.soundtrack), project.story.soundtrack.data));
        }

        // Save story rooms data in Firebase Storage
        for (let i = 0; i < project.story.rooms.length; i += 1) {
            const room = project.story.rooms[i];

            uploadPromises.push(this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(room.panoramaUrl.backgroundImage), room.panoramaUrl.backgroundImage.data));
            uploadPromises.push(this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(room.panoramaUrl.thumbnail), room.panoramaUrl.thumbnail.data));
            uploadPromises.push(this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(room.backgroundMusic), room.backgroundMusic.data));
            uploadPromises.push(this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(room.backgroundNarration), room.backgroundNarration.data));

            // Save room hotspots data in Firebase storage
            for (let j = 0; j < room.hotspots.length; j++) {
                const hotspot = room.hotspots[j];

                uploadPromises.push(this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(hotspot.image), hotspot.image.data));
                uploadPromises.push(this.uploadFileFromDataUrl(projectSerializer.getAssetRemoteFilePath(hotspot.audio), hotspot.audio.data));
            }
        }

        await Promise.all(uploadPromises);
    }

    loadProject = async (storageProject: StorageProject): Promise<Project> => {
        const projectDeserializer = new ProjectDeserializer();

        return await projectDeserializer.deserialize(storageProject);
    }

    deleteProject = async (projectId: string) => {
        // Delete project from Firestore
        await this.firestore.collection('projects')
            .doc(projectId)
            .delete();

        // Delete project data from Storage
        const deletePromises: Promise<void>[] = [];

        const projectFiles = await this.storage.ref(`projects/${projectId}`).listAll();
        projectFiles.items.forEach((item) => {
            deletePromises.push(item.delete());
        });
        await Promise.all(deletePromises);
    }

    loadProjectWithId = async (projectId: string) => {
        const project = await this.firestore
            .collection('projects')
            .doc(projectId)
            .get();

        return project.data() as StorageProject;
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

    public async migrateLegacyProjects() {
        const legacyProjects = await this.legacyFirestore
        .collection('projects')
        .get();

        /*
        await this.migrateProjectData(legacyProjects.data(), project);

        */

        console.log(`Fetched ${legacyProjects.docs.length} legacy projects.`);

        for (let i = 0; i < legacyProjects.docs.length; i++) {
            console.log(`Migrating project ${i + 1}...`);

            const legacyProject = legacyProjects.docs[i].data();

            const project = new Project();
            const result = await this.migrateProjectData(legacyProject, project);
            if (result === -1) {
                continue;
            }

            await this.saveProject(project, legacyProjects.docs[i].data().userId);
        }
    }

    private async migrateProjectData(legacyProject: any, project: Project) {
        project.id = legacyProject.id;
        project.isPublic = legacyProject.isPublic;

        if (legacyProject.story) {
            await this.migrateStoryData(legacyProject.story, project.story);
        }
        else {
            return -1;
        }
    }

    private async migrateStoryData(legacyStory: any, story: Story) {
        story.name = legacyStory.name;
        story.tags = legacyStory.tags ? legacyStory.tags.split(',') : [];

        if (legacyStory.soundtrack.remoteFile) {
            story.soundtrack = await this.migrateSoundtrackData(legacyStory.soundtrack);
        }

        for (let i = 0; i < legacyStory.rooms.length; i++) {
            const legacyRoom = legacyStory.rooms[i];

            // If Room does not have an image - skip it
            if (!legacyRoom.image || !legacyRoom.image.remoteFile) {
                continue;
            }

            const room = await this.migrateRoomData(legacyStory.rooms[i], legacyStory.homeRoomId);

            // If panoramas for room failed to fetch - skip it
            if (!room.panoramaUrl.backgroundImage.data || !room.panoramaUrl.thumbnail.data) {
                continue;
            }

            story.rooms.push(room);
        }
    }

    private async migrateRoomData(legacyRoom: any, homeRoomId: string): Promise<Room> {
        const room = new Room();

        room.id = legacyRoom.uuid;
        room.name = legacyRoom.name;
        room.isHome = legacyRoom.uuid === homeRoomId;
        room.panoramaUrl.backgroundImage = await this.migrateImageData(legacyRoom.image);
        room.panoramaUrl.thumbnail = await this.migrateImageData(legacyRoom.thumbnail);

        if (legacyRoom.ambient.remoteFile) {
            room.backgroundMusic = await this.migrateSoundtrackData(legacyRoom.ambient);
        }
        if (legacyRoom.narrator.remoteFile) {
            room.backgroundNarration = await this.migrateSoundtrackData(legacyRoom.narrator);
        }

        for (let i = 0; i < legacyRoom.doors.length; i++) {
            const door = this.migrateDoorData(legacyRoom.doors[i]);
            room.doors.push(door);
        }

        for (let i = 0; i < legacyRoom.universal.length; i++) {
            const hotspot = await this.migrateHotspotData(legacyRoom.universal[i]);
            room.hotspots.push(hotspot);
        }

        return room;
    }

    private migrateDoorData(legacyDoor: any) {
        const door = new Door();

        door.id = legacyDoor.uuid;
        door.label = legacyDoor.name;
        door.location.x = Number(legacyDoor.vect.replace('<', '').replace('>', '').split(',')[0]);
        door.location.y = Number(legacyDoor.vect.replace('<', '').replace('>', '').split(',')[1]);
        door.targetRoomId = legacyDoor.file;

        return door;
    }

    private async migrateHotspotData(legacyHotspot: any): Promise<Hotspot> {
        const hotspot = new Hotspot();

        hotspot.id = legacyHotspot.uuid;
        hotspot.label = legacyHotspot.name;
        hotspot.text = legacyHotspot.text;
        hotspot.location.x = Number(legacyHotspot.vect.replace('<', '').replace('>', '').split(',')[0]);
        hotspot.location.y = Number(legacyHotspot.vect.replace('<', '').replace('>', '').split(',')[1]);

        if (legacyHotspot.remoteImageFile) {
            hotspot.image = await this.migrateImageData({
                uuid: uuid(),
                file: legacyHotspot.imageFile,
                remoteFile: legacyHotspot.remoteImageFile
            });
        }
        if (legacyHotspot.remoteAudioFile) {
            hotspot.audio = await this.migrateSoundtrackData({
                uuid: uuid(),
                volume: legacyHotspot.volume,
                file: legacyHotspot.audioFile,
                remoteFile: legacyHotspot.remoteAudioFile
            });
        }

        return hotspot;
    }

    private async migrateSoundtrackData(legacySoundtrack: any): Promise<Soundtrack> {
        const soundtrack = new Soundtrack();

        soundtrack.id = legacySoundtrack.uuid;
        soundtrack.volume = legacySoundtrack.volume;
        soundtrack.fileName = legacySoundtrack.file;
        soundtrack.extension = legacySoundtrack.file.split('.')[1];
        soundtrack.data = await this.remotePathToDataUrl(legacySoundtrack.remoteFile);
        soundtrack.loop = false;

        if (soundtrack.data === '-1') {
            soundtrack.id = uuid();
            soundtrack.fileName = '';
            soundtrack.extension = '';
            soundtrack.data = '';
        }

        return soundtrack;
    }

    private async migrateImageData(legacyImage: any) {
        const image = new ImageAsset();

        image.id = legacyImage.uuid;
        image.extension = legacyImage.file.split('.')[1];
        image.data = await this.remotePathToDataUrl(legacyImage.remoteFile);

        if (image.data === '-1') {
            image.id = uuid();
            image.extension = '';
            image.data = '';
        }

        return image;
    }

    private async remotePathToDataUrl(remotePath: string): Promise<string> {
        let downloadUrl = '';
        try {
            downloadUrl = await this.legacyStorage.ref(remotePath).getDownloadURL();
        }
        catch (e) {
            return '-1';
        }

        return this.fetchRemoteAssetFileData(downloadUrl);
    }

    private async fetchRemoteAssetFileData(url: string): Promise<string> {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                const reader = new FileReader();
                reader.onload = function () {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result);
                    }
                };
                reader.readAsDataURL(xhr.response);
            };

            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        });
    }
}

export default new Firebase();
