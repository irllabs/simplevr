// External libraries
import { v1 as uuid } from 'uuid';

// Models
import Story from './story';

export default class Project {
    constructor() {
        this.id = uuid();
        this.isPublic = false;
        this.story = new Story();
    }
}
