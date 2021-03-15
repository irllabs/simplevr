import { v1 as uuid } from 'uuid';

export default class ImageAsset {
    constructor(data) {
        this.id = uuid();
        this.data = data;
        this.extension = '';
    }

    toJSON(projectId) {
        const json = {};

        json.id = this.id;
        json.remotePath = this.getRemoteFilePath(projectId);
        json.extension = this.extension;

        return json;
    }

    fromJSON(json) {
        this.id = json.id;
        this.remotePath = json.remotePath;
        this.extension = json.extension;
        this.data = json.data;
    }

    getRemoteFilePath(projectId) {
        return `projects/${projectId}/asset-${this.id}.${this.extension}`;
    }
}
