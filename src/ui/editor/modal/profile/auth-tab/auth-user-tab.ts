import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminInteractor } from 'core/admin/adminInteractor';
import { ProjectInteractor } from 'core/project/projectInteractor';

import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import { StorageInteractor } from 'core/storage/storageInteractor';
import { UserInteractor } from 'core/user/userInteractor';
import { Project } from 'data/project/projectModel';
import { MIME_TYPE_ZIP } from 'ui/common/constants';
import eventBus from 'ui/common/event-bus';

const FileSaver = require('file-saver');

@Component({
  selector: 'auth-user-tab',
  styleUrls: ['./auth-user-tab.scss'],
  templateUrl: './auth-user-tab.html',
})
export class AuthUserTab implements OnInit, OnDestroy {
  private projectList = <any>[]; //TODO: move to repo / cache
  private subscription;

  constructor(
    private userInteractor: UserInteractor,
    private projectInteractor: ProjectInteractor,
    private storageInteractor: StorageInteractor,
    private adminInteractor: AdminInteractor,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.subscription = this.projectInteractor.getProjects().subscribe(
      (projects) => {
        this.projectList = projects.map((p) => new Project(p));
      },
      error => console.error('GET /projects', error),
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  public getUserName(): string {
    return this.userInteractor.getUserName();
  }

  public onLogOutClick() {
    metaDataInteractor.checkAndConfirmResetChanges().then(() => {
      this.userInteractor.logOut();
      metaDataInteractor.loadingProject(true);
      this.router.navigate(['/editor']);
      sceneInteractor.setActiveRoomId(null);
      sceneInteractor.resetRoomManager();
      this.projectInteractor.setProject(null);
      eventBus.onSelectRoom(null, false);
      metaDataInteractor.setIsReadOnly(false);
      metaDataInteractor.loadingProject(false);
    }, () => {});
  }

  public openProject(project: Project) {
    metaDataInteractor.checkAndConfirmResetChanges().then(() => {
      eventBus.onStartLoading();

      this.projectInteractor.openProject(project)
        .then(
          () => {
            //reset the current scene
            metaDataInteractor.setIsReadOnly(false);
            sceneInteractor.setActiveRoomId(project.story.homeRoomId);
            eventBus.onSelectRoom(sceneInteractor.getActiveRoomId(), false);
            eventBus.onStopLoading();
            metaDataInteractor.loadingProject(false);
            this.router.navigateByUrl('/editor');
          },
          (error) => {
            console.error('error', error);
            eventBus.onStopLoading();
          },
        );
    }, () => {});
  }

  public downloadProject(project: Project) {
    eventBus.onStartLoading('Saving your project, just a moment...');

    this.projectInteractor.getProjectAsBlob(project)
      .then(
        (projectBlob) => {
          const blob = new Blob([projectBlob], { type: MIME_TYPE_ZIP });

          FileSaver.saveAs(blob, `${project.name}.zip`);

          eventBus.onStopLoading();
        },
        (error) => {
          eventBus.onStopLoading();
          eventBus.onModalMessage('error', error.message);
        },
      );
  }

  public shareProject(projectId: number) {
    const userId: string = this.userInteractor.getUserId();
    eventBus.onShareableModal(userId, projectId + '');
  }

  public openMultiView(projectId: number) {
    metaDataInteractor.checkAndConfirmResetChanges().then(() => {
      console.log('onOpenMultiView');
      const userId = this.userInteractor.getUserId();
      const queryParams = {
        multiview: `${userId}-${projectId}`,
      };
      this.router.navigate(['editor', 'preview'], { queryParams });
    }, () => {});
  }

  private isWorkingOnSavedProject(): boolean {
    return this.projectInteractor.isWorkingOnSavedProject();
  }

  private userHasProjects(): boolean {
    return !!this.projectList && this.projectList.length;
  }

  private getActiveProjectName(): string {
    const projectId: string = this.projectInteractor.getProject().id;
    const activeProject = this.projectList.find(project => (project.id === projectId));
    return activeProject && activeProject.name;
  }

  private projectIsSelected(projectId: string): boolean {
    const project: Project = this.projectInteractor.getProject();

    return project && project.id === projectId;
  }

  private userIsAdmin(): boolean {
    return this.adminInteractor.isAdmin();
  }

  private onExploreClick($event) {
    // this.eventBus.onExploreModal();
    this.router.navigateByUrl('/explore');
  }

  private onAdminClick($event) {
    this.router.navigateByUrl('/admin');
  }
}
