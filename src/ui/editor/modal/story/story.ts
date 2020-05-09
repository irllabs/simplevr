import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectInteractor } from 'core/project/projectInteractor';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';

import sceneInteractor from 'core/scene/sceneInteractor';
import { StorageInteractor } from 'core/storage/storageInteractor';
import { UserInteractor } from 'core/user/userInteractor';

import { Audio } from 'data/scene/entities/audio';

import { DEFAULT_PROJECT_NAME, DEFAULT_VOLUME } from 'ui/common/constants';
import eventBus from 'ui/common/event-bus';
import { SlideshowBuilder } from 'ui/editor/util/slideshowBuilder';
import { Project } from '../../../../data/project/projectModel';
import settingsInteractor from 'core/settings/settingsInteractor';
import { audioDuration } from 'ui/editor/util/audioDuration';

const FileSaver = require('file-saver');

@Component({
  selector: 'story',
  styleUrls: ['./story.scss'],
  templateUrl: './story.html',
})
export class Story {

  private isBeingInstantiated: boolean = true;
  private projectList: any;
  private subscription: any;
  constructor(
    private router: Router,
    private storageInteractor: StorageInteractor,
    private userInteractor: UserInteractor,
    private projectInteractor: ProjectInteractor,
    private slideshowBuilder: SlideshowBuilder,
    private element: ElementRef,
  ) {
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

  private ngOnInit(){
    this.subscription = this.projectInteractor.getProjects().subscribe(
      (projects) => {
        this.projectList = projects.map((p) => new Project(p));
      },
      error => console.error('GET /projects', error),
    );
  }

  private ngOnDestroy() {
    if(this.subscription){
      this.subscription.unsubscribe()
      this.subscription = null
    }

  }

  public getProjectName(): string {
    const projectName: string = metaDataInteractor.getProjectName();

    return projectName === DEFAULT_PROJECT_NAME ? undefined : projectName;
  }

  public setProjectName($event) {
    metaDataInteractor.setProjectName($event.text);
  }

  public getProjectTags(): string {
    return metaDataInteractor.getProjectTags();
  }

  public setProjectTags($event) {
    metaDataInteractor.setProjectTags($event.text);
  }

  public getSoundtrack(): Audio {
    return metaDataInteractor.getSoundtrack();
  }

  private removeSoundtrack() {
    metaDataInteractor.removeSoundtrack();
  }

  public getSoundtrackVolume(): number {
    return metaDataInteractor.getSoundtrackVolume();
  }

  public onSoundtrackLoad($event) {
    const { maxSoundtrackAudioDuration, maxSoundtrackAudioFilesize } = settingsInteractor.settings;
    if ($event.file.size/1024/1024 >= maxSoundtrackAudioFilesize) {
      eventBus.onModalMessage('Error', `File is too big. File should be less than ${maxSoundtrackAudioFilesize} megabytes `)
      return;
    }
    audioDuration($event.file)
      .then(duration => {
        if(duration >= maxSoundtrackAudioDuration){
          eventBus.onModalMessage('Error', `Duration of soundtrack is too long. It should be less that ${maxSoundtrackAudioDuration} seconds`)
          return 
        }

        metaDataInteractor.setSoundtrack($event.file.name, DEFAULT_VOLUME, $event.binaryFileData);
      })
  }

  public onVolumeChange($event) {
    const volume = $event.currentTarget.volume;
    metaDataInteractor.setSoundtrackVolume(volume);
  }

  public onNewStoryClick($event) {
    metaDataInteractor.checkAndConfirmResetChanges().then(() => {
      metaDataInteractor.loadingProject(true);
      this.router.navigate(['/editor', { outlets: { 'modal': 'upload' } }]);
        if ($event.shiftKey) {
          eventBus.onOpenFileLoader('zip');
          return;
        }
        this.removeSoundtrack();
        sceneInteractor.setActiveRoomId(null);
        sceneInteractor.resetRoomManager();
        this.projectInteractor.setProject(null);
        eventBus.onSelectRoom(null, false);
        metaDataInteractor.setIsReadOnly(false);
        metaDataInteractor.loadingProject(false);
    }, () => {});
  }

  public onOpenStoryLocallyClick(event) {
    metaDataInteractor.checkAndConfirmResetChanges().then(() => {
      // if (!this.userInteractor.isLoggedIn()) {
      //   this.eventBus.onModalMessage('Error', 'You must be logged in to upload from .zip');
      //   return;
      // }

      eventBus.onOpenFileLoader('zip');
      this.router.navigate(['/editor', { outlets: { 'modal': null } }]);
    }, () => {});
  }

  public onSaveStoryClick(event) {
    if (metaDataInteractor.projectIsEmpty()) {
      eventBus.onModalMessage('Error', 'Cannot save an empty project');
      return;
    }
    if (!this.userInteractor.isLoggedIn()) {
      eventBus.onModalMessage('Error', 'You must be logged in to save to the server');
      return;
    }
    if (metaDataInteractor.getIsReadOnly()) {
      eventBus.onModalMessage('Permissions Error', 'It looks like you are working on a different user\'s project. You cannot save this to your account but you can save it locally by shift-clicking the save button.');
      return;
    }

    this.saveStoryFileToServer();
  }

  public onSaveStoryLocallyClick(event) {
    if (metaDataInteractor.projectIsEmpty()) {
      eventBus.onModalMessage('Error', 'Cannot save an empty project');
      return;
    }

    if (metaDataInteractor.getIsReadOnly()) {
      eventBus.onModalMessage('Permissions Error', 'It looks like you are working on a different user\'s project. You cannot save this to your account but you can save it locally by shift-clicking the save button.');
      return;
    }
    if (!this.userInteractor.isLoggedIn()) {
      eventBus.onModalMessage('Error', 'You must be logged in to download as .zip');
      return;
    }

    const projectName = metaDataInteractor.getProjectName() || 'StoryFile';
    const zipFileName = `${projectName}.zip`;

    eventBus.onStartLoading();

    this.storageInteractor.serializeProject()
      .subscribe(
        (zipFile) => {
          eventBus.onStopLoading();
          FileSaver.saveAs(zipFile, zipFileName);
        },
        (error) => {
          eventBus.onStopLoading();
          eventBus.onModalMessage('File Download Error', error);
        },
      );
  }

  private saveStoryFileToServer() {
    const project: Project = this.projectInteractor.getProject();
    const isWorkingOnSavedProject: boolean = this.projectInteractor.isWorkingOnSavedProject();

    const onSuccess = () => {
      eventBus.onStopLoading();
      eventBus.onModalMessage('', 'Your project has been saved.');
    };

    const onError = (error) => {
      eventBus.onStopLoading();
      eventBus.onModalMessage('Save error', error);
    };

    eventBus.onStartLoading();

    if (isWorkingOnSavedProject) {
      this.projectInteractor.updateProject(project).then(onSuccess, onError);
    } else {
      // console.log(this.projectList)
      if (this.projectList.length >= settingsInteractor.settings.maxProjects) {
        return onError("You have reached maximum number of projects");
      }
      this.projectInteractor.createProject().then(onSuccess, onError);
    }
  }
}
