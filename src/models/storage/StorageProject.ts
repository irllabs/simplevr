// Models - Storage
import StorageStory from './StorageStory';

export default class StorageProject {
	public id: string;
	public isPublic: boolean;
	public userId: string;
	public createdAt: string;
	public story: StorageStory;
}
