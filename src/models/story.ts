// Models
import Room from './room';
import Soundtrack from './soundtrack';

export default class Story {
    public name = 'My Story';
    public soundtrack = new Soundtrack();
    public tags: string[] = [];
    public rooms: Room[] = [];
    public roomHistory: string[] = [];

    getActiveRoom(): Room {
        return this.rooms.find((room) => {
            return room.active;
        });
    }
}
