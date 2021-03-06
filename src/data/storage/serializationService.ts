import { Injectable } from '@angular/core';
import { RoomManager } from 'data/scene/roomManager';
import { resizeImage } from 'data/util/imageResizeService';

import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';

import {
  DEFAULT_FILE_NAME,
  MIME_TYPE_UTF8,
  STORY_FILE_JSON,
  STORY_FILE_YAML,
  STORY_VERSION,
} from 'ui/common/constants';
import { Audio } from '../scene/entities/audio';
import { Image } from '../scene/entities/image';
import { Room } from '../scene/entities/room';
import { Universal } from '../scene/entities/universal';

const JSZip = require('jszip');
const JsYaml = require('js-yaml');

@Injectable()
export class SerializationService {

  constructor(
    private roomManager: RoomManager
  ) {
  }

  public zipStoryFile(): Observable<any> {
    return this._buildProjectZip();
  }

  public buildProjectJson() {
    const roomList = Array.from(this.roomManager.getRooms()).map(room => room.toJson());
    const name = this.roomManager.getProjectName();

    return {
      version: STORY_VERSION,
      name: name,
      tags: this.roomManager.getProjectTags(),
      soundtrack: this.roomManager.getSoundtrack().toJson(),
      soundtrackVolume: this.roomManager.getSoundtrackVolume(),
      description: this.roomManager.getProjectDescription(),
      homeRoomId: this.roomManager.getHomeRoomId(),
      rooms: roomList,
    };
  }

  public extractAllMediaFiles() {
    const mediaFiles = [];

    mediaFiles.push(this.roomManager.getSoundtrack().getMediaFile());

    Array.from(this.roomManager.getRooms()).forEach((room: Room) => {
      mediaFiles.push(room.getBackgroundImage().getMediaFile());
      mediaFiles.push(room.getBackgroundAudio().getMediaFile());
      mediaFiles.push(room.getThumbnail().getMediaFile());
      mediaFiles.push(room.getNarrator().getIntroAudio().getMediaFile());
      mediaFiles.push(room.getNarrator().getReturnAudio().getMediaFile());
      mediaFiles.push(room.getBackgroundVideoMediaFile());

      Array.from(room.getUniversal()).forEach((universal: Universal) => {
        mediaFiles.push(universal.audioContent);
        mediaFiles.push(universal.imageContent);
      });
    });

    return mediaFiles;
  }

  public buildAssetDirectories(zip, rooms: Room[]) {
    Array
      .from(rooms)
      .forEach((room: Room) => {
        const directoryName: string = room.getId();
        const roomHasImage: boolean = room.getFileName() !== DEFAULT_FILE_NAME;
        const files = [];

        Array.from(room.getUniversal()).forEach((universal) => {
          // has Image
          const image = universal.imageContent;

          if (image.hasAsset()) {
            files.push({
              name: image.getFileName(),
              binaryData: this._getBase64FromDataUrl(image.getBinaryFileData(true)),
            });
          }

          // has Audio
          const audio = universal.audioContent;

          if (audio.hasAsset()) {
            files.push({
              name: audio.getFileName(),
              binaryData: this._getBase64FromDataUrl(audio.getBinaryFileData(true)),
            });
          }
        });

        files.forEach((file) => {
          zip.folder(directoryName).file(file.name, file.binaryData, { base64: true });
        });

        // Narrator intro audio
        const introAudio = room.getNarrator().getIntroAudio();
        const returnAudio = room.getNarrator().getReturnAudio();

        if (introAudio.hasAsset()) {
          const fileName = introAudio.getFileName();
          const dataUrlString = this._getBase64FromDataUrl(introAudio.getBinaryFileData(true));

          zip.folder(directoryName).file(fileName, dataUrlString, { base64: true });
        }

        if (returnAudio.hasAsset()) {
          const fileName = returnAudio.getFileName();
          const dataUrlString = this._getBase64FromDataUrl(returnAudio.getBinaryFileData(true));

          zip.folder(directoryName).file(fileName, dataUrlString, { base64: true });
        }

        // Room background image
        if (roomHasImage) {
          const roomImageName: string = room.getFileName();
          const roomBinaryImageData: string = this._getBase64FromDataUrl(room.getBackgroundImageBinaryData(true));

          zip.folder(directoryName).file(roomImageName, roomBinaryImageData, { base64: true });
        }

        // Room background thumbnail
        if (room.getThumbnailImage()) {
          const thumbnailImageData: string = this._getBase64FromDataUrl(room.getThumbnailImage(true));

          zip.folder(directoryName).file(room.getThumbnail().getFileName(), thumbnailImageData, { base64: true });
        }

        // Room background audio
        if (room.getBackgroundAudio().hasAsset()) {
          const fileName: string = room.getBackgroundAudio().getFileName();
          const audioData: string = this._getBase64FromDataUrl(room.getBackgroundAudio().getBinaryFileData(true));

          zip.folder(directoryName).file(fileName, audioData, { base64: true });
        }
      });

    return new Promise((resolve, reject) => resolve(zip));
  }

  public zipStoryFiles(zip, story) {
    return Promise.all([
      zip.file(STORY_FILE_JSON, this._buildJsonStoryFile(story)),
      zip.file(STORY_FILE_YAML, this._buildYamlStoryFile(story)),
    ]);
  }

  public zipHomeRoomImage(zip, homeRoom: Room) {
    const thumbnail = homeRoom.getThumbnail();
    let promise;

    if (thumbnail.hasAsset()) {
      promise = Promise.resolve(thumbnail);
    } else {
      const binaryFile: string = homeRoom.getBackgroundImageBinaryData(true);

      promise = resizeImage(binaryFile, 'projectThumbnail')
        .then((binaryData) => {
          thumbnail.setBinaryFileData(binaryData);

          return thumbnail;
        });
    }

    return promise.then((thumbnail: Image) => {
      return zip.file(
        thumbnail.getFileName(),
        this._getBase64FromDataUrl(thumbnail.getBinaryFileData(true)), { base64: true },
      );
    });
  }

  public zipProjectSoundtrack(zip, soundtrack: Audio) {
    if (soundtrack.hasAsset()) {
      return zip.file(
        soundtrack.getFileName(),
        this._getBase64FromDataUrl(soundtrack.getBinaryFileData(true)), { base64: true },
      );
    }
  }

  private _buildJsonStoryFile(projectJson) {
    const projectSerialized = JSON.stringify(projectJson);

    return new Blob([projectSerialized], { type: MIME_TYPE_UTF8 });
  }

  private _buildYamlStoryFile(projectJson) {
    const projectSerialized = JsYaml.dump(projectJson);

    return new Blob([projectSerialized], { type: MIME_TYPE_UTF8 });
  }

  private _zipHomeRoomImage(zip): Promise<any> {
    const homeRoomId = this.roomManager.getHomeRoomId();
    const homeRoom = this.roomManager.getRoomById(homeRoomId);

    return this.zipHomeRoomImage(zip, homeRoom);
  }

  private _zipProjectSoundtrack(zip): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.roomManager.getSoundtrack().hasAsset()) {
        resolve(this.roomManager.getSoundtrack());
      } else {
        reject('no Soundtrack');
      }
    }).then((soundtrack: Audio) => {
      return this.zipProjectSoundtrack(zip, soundtrack);
    });
  }

  private _buildProjectZip() {
    const zip = new JSZip();

    // Promises to be completed before ZIP file is created
    const promises = [
      // Prepare assets, then build story files
      this.buildAssetDirectories(zip, Array.from(this.roomManager.getRooms()))
        .then(() => {
          const projectJson = this.buildProjectJson();

          return this.zipStoryFiles(zip, projectJson);
        }),

      // Add homeroom image to ZIP
      this._zipHomeRoomImage(zip),

      // Add project soundtrack to ZIP
      this._zipProjectSoundtrack(zip).catch(error => console.log(error)),
    ];

    // Build ZIP
    const zipBuilder = Promise.all(promises).then(() => zip.generateAsync({ type: 'blob' }));

    return Observable.fromPromise(zipBuilder);
  }

  private _getBase64FromDataUrl(dataUrlString): string {
    return dataUrlString.substring(dataUrlString.indexOf(',') + 1);
  }
}


