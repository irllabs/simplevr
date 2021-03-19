import { v1 as uuid } from 'uuid';

export default class ImageAsset {
    constructor(data) {
        this.id = uuid();
        this.data = data;
        this.extension = '';
        this.preloaded = false;
    }
}
