// Models
import Project from "../models/project";
import Story from "../models/story";
import Room from "../models/room";
import Soundtrack from "../models/soundtrack";

// Models - Storage
import StorageProject from "../models/storage/StorageProject";
import StorageStory from "../models/storage/StorageStory";
import StorageSoundtrack from "../models/storage/StorageSoundtrack";
import StorageRoom from "../models/storage/StorageRoom";

// Firebase
import firebase from '../firebase/firebase';
import StorageImageAsset from "../models/storage/StorageImageAsset";
import ImageAsset from "../models/image-asset";
import StorageHotspot from "../models/storage/StorageHotspot";
import Hotspot from "../models/hotspot";
import StorageLocation from "../models/storage/StorageLocation";
import Vector2 from "../util/Vector2";
import StorageDoor from "../models/storage/StorageDoor";
import Door from "../models/door";

export default class ProjectDeserializer {
    private downloadUrlsMap = new Map<string, string>();

    public async deserialize(storageProject: StorageProject): Promise<Project> {
        await this.getDownloadUrlsForProjectAssets(storageProject);

        const project = new Project();

        project.id = storageProject.id;
        project.isPublic = storageProject.isPublic;
		project.createdAt = new Date(Date.parse(storageProject.createdAt));
        project.story = this.deserializeStoryData(storageProject.story);

        return project;
    }

    private deserializeStoryData(storageStory: StorageStory): Story {
        const story = new Story();

        story.name = storageStory.name;
        story.tags = storageStory.tags ? storageStory.tags.split(',') : [];
        if (storageStory.soundtrack) {
            story.soundtrack = this.deserializeSoundtrackData(storageStory.soundtrack);
        }

        storageStory.rooms.forEach((room) => {
            story.rooms.push(this.deserializeRoomData(room));
        });

        return story;
    }

    private deserializeRoomData(storageRoom: StorageRoom): Room {
        const room = new Room();

        room.id = storageRoom.id;
        room.name = storageRoom.name;
        room.isHome = storageRoom.isHome;
        room.panoramaUrl.backgroundImage = this.deserializeImageAssetData(storageRoom.panorama);
        room.panoramaUrl.thumbnail = this.deserializeImageAssetData(storageRoom.thumbnail);
        if (storageRoom.music) {
            room.backgroundMusic = this.deserializeSoundtrackData(storageRoom.music);
        }
        if (storageRoom.narration) {
            room.backgroundNarration = this.deserializeSoundtrackData(storageRoom.narration);
        }

        storageRoom.hotspots.forEach((hotspot) => {
            room.hotspots.push(this.deserializeHotspotData(hotspot));
        });
        storageRoom.doors.forEach((door) => {
            room.doors.push(this.deserializeDoorData(door));
        });

        return room;
    }

    private deserializeHotspotData(storageHotspot: StorageHotspot): Hotspot {
        const hotspot = new Hotspot();

        hotspot.id = storageHotspot.id;
        hotspot.label = storageHotspot.label;
        hotspot.text = storageHotspot.text;
        hotspot.location = this.deserializeLocationData(storageHotspot.location);
        if (storageHotspot.image) {
            hotspot.image = this.deserializeImageAssetData(storageHotspot.image);
        }
        if (storageHotspot.audio) {
            hotspot.audio = this.deserializeSoundtrackData(storageHotspot.audio);
        }

        return hotspot;
    }

    private deserializeDoorData(storageDoor: StorageDoor): Door {
        const door = new Door();

        door.id = storageDoor.id;
        door.label = storageDoor.label;
        door.targetRoomId = storageDoor.targetRoomId;
        door.location = this.deserializeLocationData(storageDoor.location);

        return door;
    }

    private deserializeSoundtrackData(storageSoundtrack: StorageSoundtrack): Soundtrack {
        const soundtrack = new Soundtrack();

        soundtrack.id = storageSoundtrack.id;
        soundtrack.fileName = storageSoundtrack.fileName;
        soundtrack.extension = storageSoundtrack.extension;
        soundtrack.volume = storageSoundtrack.volume;
        soundtrack.data = this.downloadUrlsMap.get(storageSoundtrack.id);

        return soundtrack;
    }

    private deserializeImageAssetData(storageImageAsset: StorageImageAsset): ImageAsset {
        const imageAsset = new ImageAsset();

        imageAsset.id = storageImageAsset.id;
        imageAsset.extension = storageImageAsset.extension;
        imageAsset.data = this.downloadUrlsMap.get(storageImageAsset.id);

        return imageAsset;
    }

    private deserializeLocationData(storageLocation: StorageLocation): Vector2 {
        return new Vector2(storageLocation.x, storageLocation.y);
    }

    private async getDownloadUrlsForProjectAssets(project: StorageProject) {
        const promises = [];

        const story = project.story;
        if (story.soundtrack) {
            promises.push(this.getDownloadUrlForAsset(story.soundtrack.remoteFilePath, story.soundtrack.id));
        }

        const rooms = story.rooms;
        rooms.forEach((room) => {
            promises.push(this.getDownloadUrlForAsset(room.panorama.remoteFilePath, room.panorama.id));
            promises.push(this.getDownloadUrlForAsset(room.thumbnail.remoteFilePath, room.thumbnail.id));
            if (room.music) {
                promises.push(this.getDownloadUrlForAsset(room.music.remoteFilePath, room.music.id));
            }
            if (room.narration) {
                promises.push(this.getDownloadUrlForAsset(room.narration.remoteFilePath, room.narration.id));
            }

            room.hotspots.forEach((hotspot) => {
                if (hotspot.image) {
                    promises.push(this.getDownloadUrlForAsset(hotspot.image.remoteFilePath, hotspot.image.id));
                }
                if (hotspot.audio) {
                    promises.push(this.getDownloadUrlForAsset(hotspot.audio.remoteFilePath, hotspot.audio.id));
                }
            });
        });

        await Promise.all(promises);
    }

    private async getDownloadUrlForAsset(remoteFilePath: string, assetId: string) {
        const url = await firebase.getDownloadUrl(remoteFilePath);

        this.downloadUrlsMap.set(assetId, url);
    }
}
