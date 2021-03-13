export default class Story {
    constructor() {
        this.rooms = [];
        this.currentRoom = null;
    }

    addRoom(room) {
        this.rooms.push(room);
    }
}
