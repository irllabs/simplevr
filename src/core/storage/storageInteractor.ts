import assetManager from 'data/asset/assetManager';

import deserializationService from 'data/storage/deserializationService';
import serializationService from 'data/storage/serializationService';
import { Observable } from 'rxjs/Observable';

class StorageInteractor {

	serializeProject() {
		return serializationService.zipStoryFile();
	}

	deserializeProject(file: any): Promise<any> {
		return deserializationService
		.unzipStoryFile(file)
		.then(() => {
			assetManager.clearAssets();
		});
	}
}
export default new StorageInteractor();
