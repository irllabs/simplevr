import { v1 as uuid } from 'uuid';

export default class ImageAsset {
    constructor(data) {
        this.id = uuid();
        this.data = data;
        this.extension = '';
    }

    getRemoteFilePath(projectId) {
        return `projects/${projectId}/asset-${this.id}.${this.extension}`;
    }
}
