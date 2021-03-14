// External libraries
import { v1 as uuid } from 'uuid';

// Models
import Story from './story';
import ImageAsset from './image-asset';

export default class Project {
    constructor() {
        this.id = uuid();
        this.isPublic = false;
        this.thumbnail = new ImageAsset();
        this.story = new Story();
    }

    /**
     * Package all project data in a single object that's going to be stored in Firebase Firestore
     */
    toJSON(userId) {
        return {
            id: this.id,
            isPublic: this.isPublic,
            thumbnailUrl: this.thumbnail.getRemoteFilePath(this.id),
            story: this.story.toJSON(),
            userId: userId,
        };
    }
}
