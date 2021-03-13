// External libraries
import { v1 as uuid } from 'uuid';

// Util
import Vector2 from '../util/Vector2';

export default class Hotspot {
    constructor() {
        this.id = uuid();
        this.label = 'Hotspot';
        this.location = new Vector2();
        this.image = null;
        this.text = 'test text 123 123';
        this.audio = null;
    }

    getIcon(extension) {
        const parts = [];

        if (this.image) {
            parts.push('image');
        }

        if (this.text) {
            parts.push('text');
        }

        if (this.audio) {
            parts.push('audio');
        }
        return `icon-${parts.length > 0 ? parts.join('-') : 'add'}.${extension || 'png'}`;
    }
}
