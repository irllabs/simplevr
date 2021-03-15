import { v1 as uuid } from 'uuid';
import ImageAsset from './image-asset';

export default class Room {
    constructor() {
        this.id = uuid();
        this.name = 'New Room';
        this.panoramaUrl = {
            backgroundImage: new ImageAsset(),
            thumbnail: new ImageAsset(),
        };
        this.hotspots = [];
        this.doors = [];
    }

    toJSON(projectId) {
        const json = {};

        json.id = this.id;
        json.name = this.name;
        json.panoramaUrl = {
            backgroundImage: this.panoramaUrl.backgroundImage.toJSON(projectId),
            thumbnail: this.panoramaUrl.thumbnail.toJSON(projectId),
        };

        return json;
    }

    fromJSON(json) {
        this.id = json.id;
        this.name = json.name;

        this.panoramaUrl.backgroundImage.fromJSON(json.panoramaUrl.backgroundImage);
        this.panoramaUrl.thumbnail.fromJSON(json.panoramaUrl.thumbnail);
    }
}
