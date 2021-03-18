// Models - Storage
import StorageImageAsset from "./StorageImageAsset";
import StorageSoundtrack from "./StorageSoundtrack";
import StorageHotspot from "./StorageHotspot";
import StorageDoor from "./StorageDoor";

export default class StorageRoom {
    public id: string;
    public name: string;
    public isHome: boolean;
    public panorama: StorageImageAsset;
    public thumbnail: StorageImageAsset;
    public music: StorageSoundtrack;
    public narration: StorageSoundtrack;
    public hotspots: StorageHotspot[] = [];
    public doors: StorageDoor[] = [];
}
