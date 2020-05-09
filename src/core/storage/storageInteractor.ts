import { Injectable } from '@angular/core';
import assetManager from 'data/asset/assetManager';

import { DeserializationService } from 'data/storage/deserializationService';
import { SerializationService } from 'data/storage/serializationService';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class StorageInteractor {

	constructor(
		private deserializationService: DeserializationService,
		private serializationService: SerializationService,
	) {}

	serializeProject(): Observable<any> {
		return this.serializationService.zipStoryFile();
	}

	deserializeProject(file: any): Promise<any> {
		return this.deserializationService
		.unzipStoryFile(file)
		.then(() => {
			assetManager.clearAssets();
		});
	}
}
