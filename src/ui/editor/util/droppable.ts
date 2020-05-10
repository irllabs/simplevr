import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

import eventBus from 'ui/common/event-bus';
import fileLoaderUtil from 'ui/editor/util/fileLoaderUtil';

@Directive({
  selector: '[droppable]',
})
export class Droppable {

  @Output() onFileLoad = new EventEmitter();
  @Input() acceptedFileType: string;
  @Input() acceptMultpleFiles: boolean = false;

  //prevent download of unintentionally dropped files
  private static staticConstructor = (() => {
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => e.preventDefault());
  })();

  @HostListener('dragover', ['$event'])
  onDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('drop', ['$event'])
  onDrop(event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.acceptMultpleFiles) {
      this.onFileLoad.emit({
        files: event.dataTransfer.files,
      });
      return;
    }

    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) {
      eventBus.onModalMessage('Error', 'No valid file selected');
      return;
    }
    if (!this.acceptedFileType) {
      console.error('file-loader must have an accepted file type');
      return;
    }

    fileLoaderUtil.validateFileLoadEvent(file, this.acceptedFileType)
      .then(fileLoaderUtil.getBinaryFileData.bind(fileLoaderUtil))
      .then(fileData => {
        this.onFileLoad.emit({
          binaryFileData: fileData,
          file: file,
        });
      })
      .catch(error => eventBus.onModalMessage('Error', error));
  }

}
