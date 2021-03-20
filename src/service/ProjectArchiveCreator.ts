// External
import JSZip from 'jszip';
import download from 'downloadjs';

// Models
import StorageProject from '../models/storage/StorageProject';

// Firebase
import firebase from '../firebase/firebase';

// Models - Storage
import StorageSoundtrack from '../models/storage/StorageSoundtrack';
import StorageStory from '../models/storage/StorageStory';
import StorageRoom from '../models/storage/StorageRoom';
import StorageImageAsset from '../models/storage/StorageImageAsset';
import StorageHotspot from '../models/storage/StorageHotspot';

export default class ProjectArchiveCreator {
    private zip = new JSZip();

    public async create(project: StorageProject): Promise<void> {
        await this.storeProjectData(project);

        const zipFile = await this.zip.generateAsync({
            type: 'blob'
        });

        download(zipFile, project.story.name);
    }

    private async storeProjectData(project: StorageProject) {
        this.zip.file('project-data.json', JSON.stringify(project));

        await this.storeStoryData(project.story);
    }

    private async storeStoryData(story: StorageStory) {
        const promises = [];

        if (story.soundtrack) {
            promises.push(this.storeAsset(story.soundtrack));
        }

        story.rooms.forEach((room) => {
            promises.push(this.storeRoomData(room));
        });

        await Promise.all(promises);
    }

    private async storeRoomData(room: StorageRoom) {
        const promises = [];

        promises.push(this.storeAsset(room.panorama));
        promises.push(this.storeAsset(room.thumbnail));
        if (room.music) {
            promises.push(this.storeAsset(room.music));
        }
        if (room.narration) {
            promises.push(this.storeAsset(room.narration));
        }

        room.hotspots.forEach((hotspot) => {
            promises.push(this.storeHotspotData(hotspot));
        });

        await Promise.all(promises);
    }

    private async storeHotspotData(hotspot: StorageHotspot) {
        const promises = [];

        if (hotspot.image) {
            promises.push(this.storeAsset(hotspot.image));
        }
        if (hotspot.audio) {
            promises.push(this.storeAsset(hotspot.audio));
        }

        await Promise.all(promises);
    }

    private async storeAsset(asset: StorageSoundtrack | StorageImageAsset) {
        const soundtrackData = await this.fetchRemoteAssetFileData(asset.remoteFilePath);

        this.zip.file(`${asset.id}.${asset.extension}`, soundtrackData, { base64: true });
    }

    private async fetchRemoteAssetFileData(remotePath: string): Promise<string | ArrayBuffer> {
        const url = await firebase.getDownloadUrl(remotePath);

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                const reader = new FileReader();
                reader.onload = function () {
                    if (typeof reader.result === 'string') {
                        // Convert data URL to base64 string
                        const result = reader.result.replace(/^data:.+;base64,/, '');
                        resolve(result);
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
