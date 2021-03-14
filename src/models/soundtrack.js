import { v1 as uuid } from 'uuid';

export default class Soundtrack {
    constructor(data, name) {
        this.id = uuid();
        this.data = data;
        this.fileName = name;
        this.extension = '';
        this.volume = 0.5;
    }

    getRemoteFilePath(projectId) {
        return `projects/${projectId}/asset-${this.id}.${this.extension}`;
    }
}
