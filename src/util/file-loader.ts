import { MIME_TYPE_MAP } from './../constants';

export default class FileLoaderUtil {
	static validateFileLoadEvent(file: File, acceptedFileType: string): Promise<File> {
		return new Promise((resolve, reject) => {
			if (!MIME_TYPE_MAP[acceptedFileType]) {
				reject('Accepted file type not valid');
			}
			if (MIME_TYPE_MAP[acceptedFileType].indexOf(file.type) < 0) {
				const errorMessage: string = `File is not a valid type, must be of type: ${acceptedFileType}.\nAccepted file types: ${MIME_TYPE_MAP[acceptedFileType].join(', ')}`;
				reject(errorMessage);
			}
			resolve(file);
		});
	}

	static getBinaryFileData(file: File): Promise<string | ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const fileReader = new FileReader();
			fileReader.onloadend = () => {
				resolve(fileReader.result);
			};
			fileReader.onerror = () => {
				const error = fileReader.error;
				reject(error);
			};
			fileReader.readAsDataURL(file);
		});
	}
}
