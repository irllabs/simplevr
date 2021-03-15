// External libraries
import { v1 as uuid } from 'uuid';

// Util
import Vector2 from '../util/Vector2';

// Models
import ImageAsset from './image-asset';
import Soundtrack from './soundtrack';

export default class Hotspot {
    constructor() {
        this.id = uuid();
        this.label = 'Hotspot';
        this.text = '';
        this.image = new ImageAsset();
        this.audio = new Soundtrack();
        this.location = new Vector2();
    }
}
