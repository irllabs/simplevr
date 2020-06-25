import firebase from 'firebase';

export enum STORY_STATE {
	ASSETS_NOT_UPLOADED = 1,
	ASSETS_UPLOADED = 2,
};

interface StoryData {
	description: string;
	homeRoomId: string;
	name: string;
	rooms: any[];
	soundtrack: {
		file: string;
		name: string;
		remoteFile: string;
		time: number;
		uuid: string;
		vect: string;
		volume: number;
	}
	soundtrackVolume: number;
	tags: string;
	version: string;
}

export default class Story {
	private _storage = firebase.storage();

	public id: string;
	public isPublic: boolean;
	public name: string;
	public nameLower: string;
	public state = STORY_STATE.ASSETS_NOT_UPLOADED;
	public story: StoryData;
	public tags: {
		[tagName: string]: boolean
	} = {};
	public thumbnailUrl: string;
	public user: string;
	public userId: string;

	constructor(storyData: firebase.firestore.DocumentData) {
		this.id = storyData.id;
		this.userId = storyData.userId;
		this.user = storyData.user;
		this.name = storyData.name;
		this.story = storyData.story;
		this.tags = storyData.tags || {};
		this.isPublic = storyData.isPublic;
		this.thumbnailUrl = storyData.thumbnailUrl;
	}

	get tagsFormatted() {
		return Object.keys(this.tags).join(', ');
	}

	public async getThumbnail(): Promise<string> {
		const homeRoom = this.story.rooms.find((room) => {
			return room.uuid === this.story.homeRoomId;
		});
		const thumbnailUrl = await this._storage.ref(homeRoom.image.remoteFile).getDownloadURL();

		return thumbnailUrl;
	}

	public toJson() {
		return {
			id: this.id,
			isPublic: this.isPublic,
			name: this.name,
			nameLower: this.nameLower,
			state: this.state,
			story: this.story,
			tags: this.tags,
			thumbnailUrl: this.thumbnailUrl,
			user: this.user,
			userId: this.userId,
		};
	}
}
