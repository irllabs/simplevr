// Models
import Room from './room';
import Soundtrack from './soundtrack';

export default class Story {
    constructor() {
        this.name = 'My Story';
        this.soundtrack = new Soundtrack();
        this.tags = [];
        this.rooms = [];
    }

    toJSON(projectId) {
        const json = {};

        json.name = this.name;
        json.tags = this.getStoryTagsString();

        json.rooms = [];
        this.rooms.forEach((room) => {
            json.rooms.push(room.toJSON(projectId));
        });

        return json;
    }

    fromJSON(json) {
        this.name = json.name;
        this.tags = json.tags ? json.tags.split(',') : [];

        json.rooms.forEach((jsonRoom) => {
            const room = new Room();
            room.fromJSON(jsonRoom);

            this.rooms.push(room);
        });
    }

    addRoom(room) {
        this.rooms.push(room);
    }

    getStoryTagsString() {
        return this.tags.join(',');
    }

    getActiveRoom() {
        return this.rooms.find((room) => {
            return room.active;
        });
    }
}
