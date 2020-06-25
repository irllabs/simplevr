import firebase from 'firebase';

import Story from 'root/models/story-model';

class StoryService {
	private _firestore = firebase.firestore();
	private _loadedStorySnapshots: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[] = [];
	private _loadedPublicStorySnapshots: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[] = [];

	public async getStoriesPageForUserAsync(userId: string, limit: number) {
		const stories = await this._firestore
		.collection('projects')
		.where('userId', '==', userId)
		.orderBy('nameLower')
		.limit(limit)
		.startAfter(this._loadedStorySnapshots[this._loadedStorySnapshots.length - 1] || null)
		.get();

		const storyModels: Story[] = [];
		stories.forEach((story) => {
			this._loadedStorySnapshots.push(story);

			storyModels.push(new Story(story.data()));
		});
		return storyModels;
	}

	public async getPublicStoriesPageAsync(limit: number) {
		const stories = await this._firestore
		.collection('projects')
		.where('isPublic', '==', true)
		.orderBy('nameLower')
		.limit(limit)
		.startAfter(this._loadedPublicStorySnapshots[this._loadedPublicStorySnapshots.length - 1] || null)
		.get();

		const storyModels: Story[] = [];
		stories.forEach((story) => {
			this._loadedPublicStorySnapshots.push(story);

			storyModels.push(new Story(story.data()));
		});
		return storyModels;
	}

	public resetUserStoryPagination() {
		this._loadedStorySnapshots = [];
	}

	public async setProjectPublicFlag(storyId: string, isPublic: boolean) {
		await this._firestore.collection('projects').doc(storyId).update({
			isPublic: isPublic,
		});
	}
}
export default new StoryService();
