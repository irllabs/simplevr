import { Injectable } from '@angular/core';
import { ProjectInteractor } from 'core/project/projectInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import { StorageInteractor } from 'core/storage/storageInteractor';

import eventBus from 'ui/common/event-bus';

@Injectable()
export class ZipFileReader {

  constructor(
    private storageInteractor: StorageInteractor,
    private projectInteractor: ProjectInteractor,
  ) {
  }

	loadFile(zipFile: any) {
		eventBus.onStartLoading();
		return this.storageInteractor.deserializeProject(zipFile)
		.then((response) => {
			sceneInteractor.setActiveRoomId(null);
			this.projectInteractor.setProject(null);
			eventBus.onSelectRoom(null, false);
			eventBus.onStopLoading();
		})
		.catch((error) => {
			const errorMessage: string = `The zip file does not seem to be a properly formatted story file. \n Error received: ${error}`;
			eventBus.onModalMessage('File Upload Error', errorMessage);
			eventBus.onStopLoading();
		})
	}
}
