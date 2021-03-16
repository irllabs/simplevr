// Models - Storage
import StorageLocation from "./StorageLocation";

export default class StorageDoor {
    public id: string;
    public label: string;
    public targetRoomId: string;
    public location: StorageLocation;
}
