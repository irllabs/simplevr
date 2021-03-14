// Models
import Soundtrack from './soundtrack';

export default class Story {
    constructor() {
        this.name = 'My Story';
        this.soundtrack = new Soundtrack();
        this.tags = [];
        this.rooms = [];
        this.currentRoom = null;
    }

    toJSON() {
        return {
            name: this.name,
            tags: this.getStoryTagsString(),
        };
    }

    addRoom(room) {
        this.rooms.push(room);
    }

    getStoryTagsString() {
        return this.tags.join(',');
    }
}
