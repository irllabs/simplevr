// Models - Storage
import StorageImageAsset from "./StorageImageAsset";
import StorageLocation from "./StorageLocation";
import StorageSoundtrack from "./StorageSoundtrack";

export default class StorageHotspot {
    public id: string;
    public label: string;
    public text: string;
    public image: StorageImageAsset;
    public audio: StorageSoundtrack;
    public location: StorageLocation;
}
