// External libraries
import { v1 as uuid } from 'uuid';

// Models
import Story from './story';

export default class Project {
    public id = uuid();
    public isPublic = false;
    public story = new Story();
}
