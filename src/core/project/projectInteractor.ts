import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import JSZip from 'jszip';

import * as firebase from 'firebase';

import assetManager from 'data/asset/assetManager';
import { Project, PROJECT_STATES } from 'data/project/projectModel';
import projectService from 'data/project/projectService';
import deserializationService from 'data/storage/deserializationService';
import serializationService from 'data/storage/serializationService';
import userService from 'data/user/userService';
import roomManager from 'data/scene/roomManager';
import { Audio } from 'data/scene/entities/audio';
import { MediaFile } from 'data/scene/entities/mediaFile';
import { Room } from 'data/scene/entities/room';

import metaDataInteractor from '../scene/projectMetaDataInteractor';
import uuid from 'uuid/v1';

const AUTOSAVE_PERIOD = 60 * 1000;

class ProjectInteractor {
	private _autoSaveTimer: number;
	private _saving: boolean = false;
	private _firestore: firebase.firestore.Firestore;
	private _storage: firebase.storage.Storage;

	private get _projectsCollection() {
		return this._firestore.collection('projects');
		//return this._firestore.collection('projects').where('userId', '==', userId).orderBy('nameLower').get();
	};

	private get _projects() {
		const userId = userService.getUserId();

		if (this._projectsCollection && userId) {
			return this._projectsCollection.where('userId', '==', userId).orderBy('nameLower').get();
		}
	};

	constructor() {
		this._firestore = firebase.firestore();
		this._storage = firebase.storage();
	}

	private _restartAutosaver() {
		if (this._autoSaveTimer) {
			clearInterval(this._autoSaveTimer);
		}

		this._autoSaveTimer = window.setInterval(() => {
			this._autoSave();
		}, AUTOSAVE_PERIOD);
	}

	private _autoSave(): void {
		if (!this._saving && metaDataInteractor.hasUnsavedChanges && projectService.isWorkingOnSavedProject()) {
			this.updateProject(this.getProject());
		}
	}

	public getProjects() {
		return this._projects;
	}

	public async updateSharableStatus(projectId: string, isPublic: boolean): Promise<any> {
		return this._projectsCollection.doc(projectId).update({ isPublic });
	}

	public getProjectData(projectId: string) {
		return this._projectsCollection.doc(projectId).get();
	}

	public openProject(project: Project) {
		return this._openProject(project);
	}

	public async openProjectById(projectId: string) {
		const project = await this._projectsCollection.doc(projectId).get();
		return this._openProject(new Project(project))
	}

	public openPublicProject(projectId: string) {
		const collectionRef = this._firestore.collection('projects');

		return collectionRef.doc(projectId).get()
			.then((response) => {
				const project = new Project(response.data());

				return this._openProject(project, false);
			});
	}

	public createProject() {
		const projectId = uuid();
		const project = new Project({
			id: projectId,
		});

		return this._saveProject(project)
			.then((project: Project) => {
				projectService.setProject(project);
			});
	}

	public updateProject(project: Project) {
		return this._saveProject(project);
	}

	public deleteProject(projectId: string) {
		return Observable.fromPromise(this._projectsCollection.doc(projectId).delete());
	}

	public getProjectAsBlob(project: Project): Promise<ArrayBuffer | Blob> {
		const story = project.story;
		const remoteFiles = deserializationService.extractAllRemoteFiles(story);
		const homeRoomId = (story.rooms.find(room => room.uuid === story.homeRoomId) || story.rooms[0]).uuid;
		const rooms: Room[] = [];
		const zip = new JSZip();
		const soundtrack: Audio = new Audio();

		const promises = [
			deserializationService
				.loadRemoteFiles(remoteFiles)
				.then((mediaFiles: MediaFile[]) => {
					deserializationService
						.deserializeRooms(story.rooms, homeRoomId, mediaFiles)
						.forEach(room => rooms.push(room));

					// get soundtrack
					if (story.soundtrack) {
						const soundtrackMediaFile = mediaFiles.find(mediaFile => mediaFile.getFileName() === story.soundtrack.file);

						if (soundtrackMediaFile) {
							soundtrack.setMediaFile(soundtrackMediaFile);
						}
					}

					return serializationService.buildAssetDirectories(zip, rooms);
				})
				.then(() => {
					const homeRoom = rooms.find(room => room.getId() === homeRoomId);

					return Promise.all([
						serializationService.zipHomeRoomImage(zip, homeRoom),
						serializationService.zipProjectSoundtrack(zip, soundtrack),
					]);
				}),


			serializationService.zipStoryFiles(zip, story),
		];

		return Promise.all(promises).then(() => zip.generateAsync({ type: 'blob' }));
	}

	public getProject(): Project {
		return projectService.getProject();
	}

	public setProject(project: Project) {
		projectService.setProject(project);
	}

	public isWorkingOnSavedProject(): boolean {
		return projectService.isWorkingOnSavedProject();
	}

	public searchPublicProjects(query: string) {
		const tags = (query || '').trim()
			.split(',')
			.map(tag => tag.trim())
			.filter(tag => tag !== '');

		if (tags.length == 0) {
			return Observable.fromPromise(Promise.resolve([]));
		}

		return Observable.forkJoin(tags.reduce((observers, tag) => {
			const observer = this._firestore
			.collection('projects')
			.where('isPublic', '==', true)
			.where(`tags.${tag}`, '==', true);

			return observers.concat(observer);
		}, []))
			.map((projectsSet) => {
				const result = [];

				return result.concat.apply(result, projectsSet);
			})
			.map((projects) => {
				const uniqueProject = [];
				const ids = [];

				projects.forEach((p) => {
					if (ids.indexOf(p.id) === -1) {
						uniqueProject.push(new Project(p));
						ids.push(p.id);
					}
				});

				return uniqueProject;
			});
	}

	private _openProject(project: Project, quick = true) {
		return deserializationService
			.deserializeProject(project, quick)
			.then((downloadRestAssets) => {
				assetManager.clearAssets();
				projectService.setProject(project);

				downloadRestAssets().then(() => {
					this._restartAutosaver();
				});

				return;
			});
	}

	private _saveProject(project: Project) {
		const projectName: string = roomManager.getProjectName();
		const projectTags: string = roomManager.getProjectTags();
		const userName = userService.getUserName();
		const userId = userService.getUserId();
		const homeRoomId = roomManager.getHomeRoomId();
		const homeRoom = roomManager.getRoomById(homeRoomId);
		const thumbnailMediaFile: MediaFile = homeRoom.getThumbnail().getMediaFile();
		const allMediaFiles = serializationService.extractAllMediaFiles();
		const deleteMediaFiles = allMediaFiles.filter((mediaFile: MediaFile) => mediaFile.hasRemoteFileToDelete());
		const uploadMediaFiles = allMediaFiles
			.filter((mediaFile: MediaFile) => mediaFile.needToUpload())
			.map((mediaFile: MediaFile) => {
				mediaFile.setRemoteFile(`projects/${project.id}/${mediaFile.getFileName()}`);

				return mediaFile;
			});
		const story = serializationService.buildProjectJson();

		this._saving = true;

		if (!project.userId) {
			project.userId = userId;
			project.user = userName;
		} else if (project.userId === userId) {
			project.user = userName;
		}

		project.name = projectName;
		project.setTags(projectTags);
		project.story = story;
		project.thumbnailUrl = `projects/${project.id}/${thumbnailMediaFile.getFileName()}`;

		const projectRef = this._projectsCollection.doc(project.id);

		return projectRef.set(project.toJson())
			.then(() => this._deleteMediaFiles(deleteMediaFiles))
			.then(() => this._uploadMediaFiles(uploadMediaFiles))
			.then(() => {
				return projectRef.update({
					state: PROJECT_STATES.ASSETS_UPLOADED,
				});
			})
			.then(() => {
				metaDataInteractor.onProjectSaved();
				this._saving = false;
				this._restartAutosaver();
				return project;
			});
	}

	private async _deleteMediaFiles(mediaFiles) {
		const deletePromises = [];
		for (let i = 0; i < mediaFiles.length; i++) {
			const mediaFile = mediaFiles[i];

			deletePromises.push(this._storage.ref(mediaFile.storedRemoteFile)
				.delete()
				.then(() => mediaFile.setStoredRemoteFile(null))
				.catch((error) => {
					console.log('Can\'t delete file from Storage:', mediaFile);
					console.log(error);
				}));
		}
		await Promise.all(deletePromises);
	}

	private async _uploadMediaFiles(mediaFiles) {
		const uploadPromises = [];
		for (let i = 0; i < mediaFiles.length; i++) {
			const mediaFile: MediaFile = mediaFiles[i];

			const task = this._storage.ref().put(mediaFile.getBlob());

			uploadPromises.push(task
				.then(() => {
					mediaFile.setStoredRemoteFile(mediaFile.getRemoteFile());
					return mediaFile;
				})
				.catch((error) => {
					console.log('Can\'t upload file to Storage:', mediaFile);
					console.log(error);
				}));
		}
		await Promise.all(uploadPromises);
	}
}
export default new ProjectInteractor();
