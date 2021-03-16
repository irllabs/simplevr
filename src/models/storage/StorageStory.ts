// Models - Storage
import StorageSoundtrack from './StorageSoundtrack';
import StorageRoom from './StorageRoom';

export default class StorageStory {
    public name: string;
    public tags: string;
    public soundtrack: StorageSoundtrack;
    public rooms: StorageRoom[] = [];
}
