import { Injectable } from '@angular/core';
import sceneInteractor from 'core/scene/sceneInteractor';
import { resizeImage } from 'data/util/imageResizeService';

import fileLoaderUtil, { mimeTypeMap } from 'ui/editor/util/fileLoaderUtil';

@Injectable()
export class SlideshowBuilder {

  build(files): Promise<any> {
    const fileList = Object.keys(files)
      .map(key => files[key])
      .sort((a, b) => a.lastModified - b.lastModified);

    return this.processBackgroundFileList(fileList);
  }

  private processBackgroundFileList(fileList): Promise<any> {
    const backgroundFiles = fileList
      .filter(file => mimeTypeMap['image'].indexOf(file.type) > -1)
      .map(file => fileLoaderUtil.getBinaryFileData(file).then(dataUrl => resizeImage(dataUrl, 'backgroundImage')));

    return Promise.all(backgroundFiles)
      .then(resizedList => resizedList.map((resized: any) => {
          let roomId = sceneInteractor.getActiveRoomId();
          let room = sceneInteractor.getRoomById(roomId);

          if (room.hasBackgroundImage()) {
            roomId = sceneInteractor.addRoom();
            room = sceneInteractor.getRoomById(roomId);
          }

          room.setBackgroundImageBinaryData(resized.backgroundImage);
          room.setThumbnail(resized.thumbnail);
          return room;
        }),
      );
  }

}
