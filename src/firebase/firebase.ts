
import firebase from 'firebase/app';
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
	apiKey: "AIzaSyDW6z4971LgZRUmcWKCORgce0nRjA68GVs",
	authDomain: "simple-vr.firebaseapp.com",
	projectId: "simple-vr",
	storageBucket: "simple-vr.appspot.com",
	messagingSenderId: "151085359051",
	appId: "1:151085359051:web:d91e0383b58a8dae56a04e",
	measurementId: "G-PS5SVL3CK3"
};

class Firebase {
	private auth: firebase.auth.Auth;
	private firestore: firebase.firestore.Firestore;
	private storage: firebase.storage.Storage;

	private onUserUpdatedObservers: Array<(user: firebase.User) => void> = [];

	public currentUser: firebase.User;

	private lastLoadedUserStory: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>;
	private lastLoadedPublicStory: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>;

	constructor() {
		if (!firebase.apps.length) {
			firebase.initializeApp(firebaseConfig);
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

	public async loadUsers() {
		const users = await this.firestore
			.collection('users')
			.get();

		const userModels: User[] = [];
		users.forEach((user) => {
			userModels.push(user.data() as User);
		});
		return userModels;
	}

	loadUserStories = async (userId: string, fromStart?: boolean) => {
		if (fromStart) {
			this.lastLoadedUserStory = null;
		}

		const stories = await this.firestore
		.collection('projects')
		.where('userId', '==', userId)
		.orderBy('id')
		.limit(8)
		.startAfter(this.lastLoadedUserStory || null)
		.get();

		if (stories.docs.length === 0) {
			return [];
		}

		this.lastLoadedUserStory = stories.docs[stories.docs.length - 1];

		const storiesData: Project[] = [];
		stories.forEach((story) => {
			storiesData.push(story.data() as Project);
		});

		return storiesData;
	}

	loadPublicStories = async (limit?: boolean, fromStart?: boolean) => {
		if (fromStart) {
			this.lastLoadedPublicStory = null;
		}

		const stories = await this.firestore
			.collection('projects')
			.where('isPublic', '==', true)
			.orderBy('id')
			.limit(limit ? 8 : 100)
			.startAfter(this.lastLoadedPublicStory || null)
			.get();

		if (stories.docs.length === 0) {
			return [];
		}

		this.lastLoadedPublicStory = stories.docs[stories.docs.length - 1];

		const storyModels: StorageProject[] = [];
		stories.forEach((story) => {
			storyModels.push(story.data() as StorageProject);
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
		// If file data is empty, or it's not in a valid data url format, skip upload.
		if (!fileData || !fileData.startsWith('data:')) {
			return;
		}
		await this.storage.ref(uploadPath).putString(fileData, firebase.storage.StringFormat.DATA_URL);
	}

	getDownloadUrl = async (remoteFilePath: string) => {
		return this.storage.ref(remoteFilePath).getDownloadURL();
	}

	addProjectAsFavorite = async (user: User, projectId: string) => {
		const favoriteProjects = [
			...user.favoriteProjects,
			projectId
		];

		user.favoriteProjects = favoriteProjects;

		await this.firestore
			.collection('users')
			.doc(user.id)
			.update({
				favoriteProjects: favoriteProjects
			});
	}

	removeProjectFromFavorites = async (user: User, projectId: string) => {
		const favoriteProjects = user.favoriteProjects.filter((favoriteProjectId) => {
			return favoriteProjectId !== projectId;
		});

		user.favoriteProjects = favoriteProjects;

		await this.firestore
			.collection('users')
			.doc(user.id)
			.update({
				favoriteProjects: favoriteProjects
			});
	}
}

export default new Firebase();
