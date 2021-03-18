// Models
import Project from "../models/project";
import Story from "../models/story";
import Room from "../models/room";
import Hotspot from "../models/hotspot";
import Door from "../models/door";
import ImageAsset from "../models/image-asset";
import Soundtrack from "../models/soundtrack";

// Models - Storage
import StorageProject from "../models/storage/StorageProject";
import StorageStory from "../models/storage/StorageStory";
import StorageRoom from "../models/storage/StorageRoom";
import StorageHotspot from "../models/storage/StorageHotspot";
import StorageDoor from "../models/storage/StorageDoor";
import StorageImageAsset from "../models/storage/StorageImageAsset";
import StorageSoundtrack from "../models/storage/StorageSoundtrack";

// Util
import Vector2 from "../util/Vector2";
import StorageLocation from "../models/storage/StorageLocation";

export default class ProjectSerializer {
    private projectId: string;
    private userId: string;

    public serialize(project: Project, userId: string): StorageProject {
        this.projectId = project.id;
        this.userId = userId;

        return this.serializeProjectData(project);
    }

    public getAssetRemoteFilePath(asset: ImageAsset | Soundtrack): string {
        return `projects/${this.projectId}/asset-${asset.id}.${asset.extension}`
    }

    private serializeProjectData(project: Project): StorageProject {
        const storageProject = new StorageProject();

        storageProject.id = project.id;
        storageProject.isPublic = project.isPublic;
        storageProject.userId = this.userId;
        storageProject.story = this.serializeStoryData(project.story);

        return storageProject;
    }

    private serializeStoryData(story: Story): StorageStory {
        const storageStory = new StorageStory();

        storageStory.name = story.name;
        storageStory.tags = story.tags.join(',');

        if (story.soundtrack.data) {
            storageStory.soundtrack = this.serializeSoundtrackData(story.soundtrack);
        }

        story.rooms.forEach((room) => {
            storageStory.rooms.push(this.serializeRoomData(room));
        });

        return storageStory;
    }

    private serializeRoomData(room: Room): StorageRoom {
        const storageRoom = new StorageRoom();

        storageRoom.id = room.id;
        storageRoom.name = room.name;
        storageRoom.isHome = room.isHome;
        storageRoom.panorama = this.serializeImageAssetData(room.panoramaUrl.backgroundImage);
        storageRoom.thumbnail = this.serializeImageAssetData(room.panoramaUrl.thumbnail);
        if (room.backgroundMusic.data) {
            storageRoom.music = this.serializeSoundtrackData(room.backgroundMusic);
        }
        if (room.backgroundNarration.data) {
            storageRoom.narration = this.serializeSoundtrackData(room.backgroundNarration);
        }

        room.hotspots.forEach((hotspot) => {
            storageRoom.hotspots.push(this.serializeHotspotData(hotspot));
        });

        room.doors.forEach((door) => {
            storageRoom.doors.push(this.serializeDoorData(door));
        });

        return storageRoom;
    }

    private serializeHotspotData(hotspot: Hotspot): StorageHotspot {
        const storageHotspot = new StorageHotspot();

        storageHotspot.id = hotspot.id;
        storageHotspot.label = hotspot.label;
        storageHotspot.text = hotspot.text;
        storageHotspot.location = this.serializeLocationData(hotspot.location);
        if (hotspot.image.data) {
            storageHotspot.image = this.serializeImageAssetData(hotspot.image);
        }
        if (hotspot.audio.data) {
            storageHotspot.audio = this.serializeSoundtrackData(hotspot.audio);
        }

        return storageHotspot;
    }

    private serializeDoorData(door: Door): StorageDoor {
        const storageDoor = new StorageDoor();

        storageDoor.id = door.id;
        storageDoor.label = door.label;
        storageDoor.targetRoomId = door.targetRoomId;
        storageDoor.location = this.serializeLocationData(door.location);

        return storageDoor;
    }

    private serializeImageAssetData(imageAsset: ImageAsset): StorageImageAsset {
        const storageImageAsset = new StorageImageAsset();

        storageImageAsset.id = imageAsset.id;
        storageImageAsset.extension = imageAsset.extension;
        storageImageAsset.remoteFilePath = this.getAssetRemoteFilePath(imageAsset);

        return storageImageAsset;
    }

    private serializeSoundtrackData(soundtrack: Soundtrack): StorageSoundtrack {
        const storageSoundtrack = new StorageSoundtrack();

        storageSoundtrack.id = soundtrack.id;
        storageSoundtrack.extension = soundtrack.extension;
        storageSoundtrack.volume = soundtrack.volume;
        storageSoundtrack.remoteFilePath = this.getAssetRemoteFilePath(soundtrack);

        return storageSoundtrack;
    }

    private serializeLocationData(location: Vector2): StorageLocation {
        const storageLocation = new StorageLocation();

        storageLocation.x = location.x;
        storageLocation.y = location.y;

        return storageLocation;
    }
}
