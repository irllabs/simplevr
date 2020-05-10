import { Component, EventEmitter, Output } from '@angular/core';
import sceneInteractor from 'core/scene/sceneInteractor';
import { Room } from 'data/scene/entities/room';
import { resizeImage } from 'data/util/imageResizeService';
import eventBus from 'ui/common/event-bus';
import fileLoaderUtil, { mimeTypeMap } from 'ui/editor/util/fileLoaderUtil';
import { SlideshowBuilder } from 'ui/editor/util/slideshowBuilder';
import { ZipFileReader } from 'ui/editor/util/zipFileReader';
import settingsInteractor from 'core/settings/settingsInteractor'


@Component({
  selector: 'default-overlay',
  styleUrls: ['./default-overlay.scss'],
  templateUrl: './default-overlay.html',
})
export class DefaultOverlay {

  @Output() onFileLoad = new EventEmitter();

  constructor(
    private zipFileReader: ZipFileReader,
    private slideshowBuilder: SlideshowBuilder,
  ) {
  }

  /*
  private selectBackground () {
    this.backgroundArray = new Aarry(
      'url("assets/images/background_baseball.JPG',
      'url("assets/images/background_bosnia-waterfall.JPG',
      'url("assets/images/background_clothing.jpg');
    const pickOne = Math.round(Math.random()*100)%3;
    header.css('background-image', this.backgroundArray[pickOne]);
  );
  }

  */

  public onFileDrop(event) {
    if (event.files && event.files.length > 1) {
      eventBus.onStartLoading();
      this.slideshowBuilder.build(event.files)
        .then(resolve => {
          eventBus.onStopLoading();
        })
        .catch(error => eventBus.onModalMessage('error', error));
      return;
    }
    const file = event.files[0];
    if (mimeTypeMap.image.indexOf(file.type) > -1) {
      this.loadImageFile(file);
    } else if (mimeTypeMap.zip.indexOf(file.type) > -1) {
      this.loadZipFile(file);
    }
  }

  public onFileChange($event) {
    const file = $event.target.files && $event.target.files[0];
    const files = $event.target.files;

    if (!file) {
      eventBus.onModalMessage('Error', 'No valid file selected');
      return;
    }

    if ($event.target.files.length > 1) {
      this.addSlideshow(files);
    } else if (mimeTypeMap.image.indexOf(file.type) > -1) {
      this.loadImageFile(file);
    } else if (mimeTypeMap.zip.indexOf(file.type) > -1) {
      this.loadZipFile(file);
    }
  }

  private loadImageFile(file) {
    const { maxBackgroundImageSize } = settingsInteractor.settings
    
    if(file.size/1024/1024 >= maxBackgroundImageSize){
      eventBus.onModalMessage('Error', `File is too large. Max file size is ${maxBackgroundImageSize} mb`)
      return;
    }

    eventBus.onStartLoading();
    fileLoaderUtil.validateFileLoadEvent(file, 'image')
      .then(fileLoaderUtil.getBinaryFileData.bind(fileLoaderUtil))
      .then(fileData => resizeImage(fileData, 'backgroundImage'))
      .then((resized) => {
        const roomId: string = sceneInteractor.getActiveRoomId();
        const room: Room = sceneInteractor.getRoomById(roomId);

        room.setBackgroundImageBinaryData(resized.backgroundImage);
        room.setThumbnail(resized.thumbnail);

        if (this.onFileLoad) {
          this.onFileLoad.emit();
        }
        eventBus.onStopLoading();
      })
      .catch(error => eventBus.onModalMessage('Error', error));
  }

  private addSlideshow(files) {
    eventBus.onStartLoading();
    this.slideshowBuilder.build(files)
      .then(resolve => eventBus.onStopLoading())
      .catch(error => eventBus.onModalMessage('error', error));
  }

  private loadZipFile(file) {
    this.zipFileReader.loadFile(file);
  }

}
