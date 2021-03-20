import { MIME_TYPE_MAP } from '../constants/constants';

export default class FileLoaderUtil {
    static validateFileLoadEvent(file, acceptedFileType) {
        return new Promise((resolve, reject) => {
            if (!MIME_TYPE_MAP[acceptedFileType]) {
                reject(new Error('Accepted file type not valid'));
            }
            if (MIME_TYPE_MAP[acceptedFileType].indexOf(file.type) < 0) {
                const errorMessage = `File is not a valid type, must be of type: ${acceptedFileType}.\n`
                + `Accepted file types: ${MIME_TYPE_MAP[acceptedFileType].join(', ')}`;
                reject(errorMessage);
            }
            resolve(file);
        });
    }

    static isFileOfType(file, type) {
        if (!MIME_TYPE_MAP[type]) {
            return false;
        }
        else if(MIME_TYPE_MAP[type].indexOf(file.type) > 0) {
            return true;
        }

        return false;
    }

    static getBinaryFileData(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = () => {
                const { error } = fileReader;
                reject(error);
            };
            fileReader.readAsDataURL(file);
        });
    }
}
