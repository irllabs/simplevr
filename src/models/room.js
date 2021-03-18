import { v1 as uuid } from 'uuid';

import ImageAsset from './image-asset';
import Soundtrack from './soundtrack';

export default class Room {
    constructor() {
        this.id = uuid();
        this.name = 'New Room';
        this.active = false;
        this.isHome = false;
        this.panoramaUrl = {
            backgroundImage: new ImageAsset(),
            thumbnail: new ImageAsset(),
        };
        this.backgroundMusic = new Soundtrack();
        this.backgroundNarration = new Soundtrack();
        this.hotspots = [];
        this.doors = [];
    }
}
