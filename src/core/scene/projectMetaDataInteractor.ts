import roomManager from './../../data/scene/roomManager';
import eventBus from '../../ui/common/event-bus';

class MetaDataInteractor {
	private _hasUnsavedChanges: boolean = false;
	private _loading: boolean = false;

	public get hasUnsavedChanges(): boolean {
		return this._hasUnsavedChanges;
	}

	constructor() {
		window.addEventListener('beforeunload',  (e) => {
			if (this.hasUnsavedChanges) {
				const confirmationMessage = "You are about lose your work. Are you sure?";

				e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
				return confirmationMessage;
			}
		});
	}

	public loadingProject(isLoading) {
		this._loading = isLoading;
	}

	public onProjectChanged() {
		if (!this._loading) {
			this._hasUnsavedChanges = true;
		}
	}

	public onProjectSaved() {
		this._hasUnsavedChanges = false;
	}

	public checkAndConfirmResetChanges(msg = 'If you do not save your changes before opening a new story file, those changes will be lost.') {
		return new Promise((resolve, reject) => {
			if (this.hasUnsavedChanges) {
				eventBus.onModalMessage(
					'',
					msg,
					true,
					// modal dismissed callback
					reject,
					// modal accepted callback
					resolve,
				);
			} else {
				resolve();
			}
		});
	}

	getProjectName(): string {
		return roomManager.getProjectName();
	}

	setProjectName(projectName: string) {
		roomManager.setProjectName(projectName);
	}

	getProjectDescription(): string {
		return roomManager.getProjectDescription();
	}

	setProjectDescription(projectDescription: string) {
		roomManager.setProjectDescription(projectDescription);
	}

	projectIsEmpty(): boolean {
		return roomManager.getProjectIsEmpty();
	}

	getProjectTags(): string {
		return roomManager.getProjectTags();
	}

	setProjectTags(tags: string) {
		roomManager.setProjectTags(tags);
	}

	getIsReadOnly(): boolean {
		return roomManager.getIsReadOnly();
	}

	setIsReadOnly(isReadOnly: boolean) {
		roomManager.setIsReadOnly(isReadOnly);
	}

	getSoundtrack(): any {
		return roomManager.getSoundtrack();
	}

	setSoundtrack(fileName: string, volume: number, dataUrl: any) {
		return roomManager.setSoundtrack(fileName, volume, dataUrl);
	}

	removeSoundtrack() {
		roomManager.removeSoundtrack();
	}

	setSoundtrackVolume(v: number) {
		roomManager.setSoundtrackVolume(v);
	}

	getSoundtrackVolume(): number {
		return roomManager.getSoundtrackVolume();
	}
}
export default new MetaDataInteractor();
