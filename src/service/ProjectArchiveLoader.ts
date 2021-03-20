// External
import JSZip from 'jszip';
import mime from 'mime-types';

// Models
import Project from '../models/project';
import Soundtrack from '../models/soundtrack';
import Story from '../models/story';
import ImageAsset from '../models/image-asset';
import Room from '../models/room';
import Hotspot from '../models/hotspot';

// Services
import ProjectDeserializer from './ProjectDeserializer';

export default class ProjectArchiveLoader {
    private zip: JSZip;
    private project: Project;

    public async load(file: File): Promise<Project> {
        this.zip = await JSZip.loadAsync(file);

        await this.loadProjectData();

        return this.project;
    }

    private async loadProjectData(): Promise<void> {
        const data = await this.zip.file('project-data.json').async('text');

        const serializer = new ProjectDeserializer();
        this.project = await serializer.deserialize(JSON.parse(data));

        this.loadStoryData(this.project.story);
    }

    private async loadStoryData(story: Story) {
        story.soundtrack.data = await this.loadAssetData(story.soundtrack);

        story.rooms.forEach((room) => {
            this.loadRoomData(room);
        });
    }

    private async loadRoomData(room: Room) {
        room.panoramaUrl.backgroundImage.data = await this.loadAssetData(room.panoramaUrl.backgroundImage);
        room.panoramaUrl.thumbnail.data = await this.loadAssetData(room.panoramaUrl.thumbnail);
        room.backgroundMusic.data = await this.loadAssetData(room.backgroundMusic);
        room.backgroundNarration.data = await this.loadAssetData(room.backgroundNarration);

        room.hotspots.forEach((hotspot) => {
            this.loadHotspotData(hotspot);
        });
    }

    private async loadHotspotData(hotspot: Hotspot) {
        hotspot.image.data = await this.loadAssetData(hotspot.image);
        hotspot.audio.data = await this.loadAssetData(hotspot.audio);
    }

    private async loadAssetData(asset: ImageAsset | Soundtrack): Promise<string | ArrayBuffer> {
        const mimeType = mime.contentType(asset.extension);
        if (typeof mimeType === 'boolean') {
            return;
        }

        const file = this.zip.file(`${asset.id}.${asset.extension}`);
        if (!file) {
            return;
        }
        const fileData = await file.async('blob');
        const blob = new Blob([fileData], { type: mimeType });

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    }
}
