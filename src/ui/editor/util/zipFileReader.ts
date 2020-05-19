import projectInteractor from 'core/project/projectInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import storageInteractor from 'core/storage/storageInteractor';

import eventBus from 'ui/common/event-bus';
import openStoryEvent from 'root/events/open-story-event';

class ZipFileReader {
	loadFile(zipFile: any) {
		eventBus.onStartLoading();
		return storageInteractor.deserializeProject(zipFile)
		.then((response) => {
			sceneInteractor.setActiveRoomId(null);
			projectInteractor.setProject(null);
			eventBus.onSelectRoom(null, false);
			eventBus.onStopLoading();
		}).then(() => {
			openStoryEvent.emit();
		})
		.catch((error) => {
			const errorMessage: string = `The zip file does not seem to be a properly formatted story file. \n Error received: ${error}`;
			eventBus.onModalMessage('File Upload Error', errorMessage);
			eventBus.onStopLoading();
		})
	}
}
export default new ZipFileReader();
