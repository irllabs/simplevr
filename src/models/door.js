// External libraries
import { v1 as uuid } from 'uuid';

// Util
import Vector2 from '../util/Vector2';

export default class Door {
    constructor() {
        this.id = uuid();
        this.label = 'Door';
        this.targetRoomId = '';
        this.location = new Vector2();
    }
}
