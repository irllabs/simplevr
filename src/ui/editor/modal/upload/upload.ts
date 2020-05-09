import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import sceneInteractor from 'core/scene/sceneInteractor';
import { Room } from 'data/scene/entities/room';
import { resizeImage } from 'data/util/imageResizeService';
import eventBus from 'ui/common/event-bus';
import { FileLoaderUtil } from 'ui/editor/util/fileLoaderUtil';
//added by ali for dragging images in
import { SlideshowBuilder } from 'ui/editor/util/slideshowBuilder';
import { ZipFileReader } from 'ui/editor/util/zipFileReader';
import settingsInteractor from 'core/settings/settingsInteractor'

@Component({
  selector: 'upload',
  styleUrls: ['./upload.scss'],
  templateUrl: './upload.html',
})
export class Upload {

  @ViewChild('editSpaceSphere') editSpaceSphere;
  @Output() onFileLoad = new EventEmitter();
  private isBeingInstantiated: boolean = false;

  constructor(
    private router: Router,
    private fileLoaderUtil: FileLoaderUtil,
    private slideshowBuilder: SlideshowBuilder,
    private zipFileReader: ZipFileReader,
    private element: ElementRef,
  ) {
  }

  @HostListener('drop', ['$event'])
  onDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) {
      return;
    }
    if (event.dataTransfer.files && event.dataTransfer.files.length > 1) {
      this.loadSlideshow(event.dataTransfer.files);
      return;
    }
    this.loadBackgroundImage(file);
  }

  @HostListener('document:click', ['$event'])
  private onDocumentClick($event) {
    const isClicked: boolean = this.element.nativeElement.contains($event.target);
    if (this.isBeingInstantiated) {
      this.isBeingInstantiated = false;
      return;
    }
    if (!isClicked) {
      this.router.navigate(['/editor', { outlets: { 'modal': null } }]);
    }
  }

  ngOnInit() {
    this.isBeingInstantiated = true;
  }

  private onFileChange($event) {
    const file = $event.target.files && $event.target.files[0];
    if (!file) {
      eventBus.onModalMessage('Error', 'No valid file selected');
      return;
    }
    if ($event.target.files && $event.target.files.length > 1) {
      this.loadSlideshow($event.target.files);
      return;
    }
    this.loadBackgroundImage(file);
  }

  private loadBackgroundImage(file) {
    const { maxBackgroundImageSize } = settingsInteractor.settings
    
    if(file.size/1024/1024 >= maxBackgroundImageSize){
      eventBus.onModalMessage('Error', `File is too large. Max file size is ${maxBackgroundImageSize} mb`)
      return;
    }

    this.router.navigate(['/editor', { outlets: { 'modal': null } }]);
    eventBus.onStartLoading();
    this.fileLoaderUtil.validateFileLoadEvent(file, 'image')
      .then(this.fileLoaderUtil.getBinaryFileData.bind(this.fileLoaderUtil))
      .then(fileData => resizeImage(fileData, 'backgroundImage'))
      .then(resized => {
        const roomId: string = sceneInteractor.addRoom();
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

  private loadSlideshow(files) {
    eventBus.onStartLoading();
    this.slideshowBuilder.build(files)
      .then(resolve => {
        eventBus.onStopLoading();
      })
      .catch(error => eventBus.onModalMessage('error', error));
  }

}
