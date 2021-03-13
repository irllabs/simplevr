import { v1 as uuid } from 'uuid';

export default class Room {
    constructor() {
        this.id = uuid();
        this.name = 'New Room';
        this.panoramaUrl = '';
        this.hotspots = [];
        this.doors = [];
    }
}
