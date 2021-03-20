// Models
import Room from './room';
import Soundtrack from './soundtrack';

export default class Story {
    public name = 'My Story';
    public soundtrack = new Soundtrack();
    public tags: string[] = [];
    public rooms: Room[] = [];

    getActiveRoom(): Room {
        return this.rooms.find((room) => {
            return room.active;
        });
    }
}
